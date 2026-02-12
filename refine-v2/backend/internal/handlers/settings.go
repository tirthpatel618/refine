package handlers

import (
	"encoding/json"
	"net/http"
	"refine-v2/backend/internal/database"
	"refine-v2/backend/internal/models"
	"strings"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func ChangePassword(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			writeError(w, http.StatusUnauthorized, "Not authenticated")
			return
		}

		var req models.ChangePasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if len(req.NewPassword) < 8 {
			writeError(w, http.StatusBadRequest, "New password must be at least 8 characters")
			return
		}

		currentHash, err := store.GetPasswordHash(claims.UserID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to verify password")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.CurrentPassword)); err != nil {
			writeError(w, http.StatusUnauthorized, "Current password is incorrect")
			return
		}

		newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to process password")
			return
		}

		if err := store.UpdatePassword(claims.UserID, string(newHash)); err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to update password")
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"message": "Password updated"})
	}
}

func ChangeUsername(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			writeError(w, http.StatusUnauthorized, "Not authenticated")
			return
		}

		var req models.ChangeUsernameRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		req.Username = strings.TrimSpace(req.Username)
		if len(req.Username) < 3 || len(req.Username) > 20 {
			writeError(w, http.StatusBadRequest, "Username must be 3-20 characters")
			return
		}

		err := store.UpdateUsername(claims.UserID, req.Username)
		if err != nil {
			if pqErr, ok := err.(*pq.Error); ok && string(pqErr.Code) == "23505" {
				writeError(w, http.StatusConflict, "Username already taken")
				return
			}
			writeError(w, http.StatusInternalServerError, "Failed to update username")
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"message": "Username updated"})
	}
}

func DeleteAccount(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			writeError(w, http.StatusUnauthorized, "Not authenticated")
			return
		}

		if err := store.DeleteUser(claims.UserID); err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to delete account")
			return
		}

		// Clear the auth cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "token",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
			Secure:   secureCookies,
			SameSite: http.SameSiteLaxMode,
		})

		writeJSON(w, http.StatusOK, map[string]string{"message": "Account deleted"})
	}
}
