package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/mail"
	"refine-v2/api/internal/auth"
	"refine-v2/api/internal/database"
	"refine-v2/api/internal/models"
	"strings"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func Signup(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.SignupRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		req.Email = strings.TrimSpace(strings.ToLower(req.Email))
		req.Username = strings.TrimSpace(req.Username)

		if _, err := mail.ParseAddress(req.Email); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid email address")
			return
		}
		if len(req.Username) < 3 || len(req.Username) > 20 {
			writeError(w, http.StatusBadRequest, "Username must be 3-20 characters")
			return
		}
		if len(req.Password) < 8 {
			writeError(w, http.StatusBadRequest, "Password must be at least 8 characters")
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to process password")
			return
		}

		user, err := store.CreateUser(req.Email, req.Username, string(hash))
		if err != nil {
			if pqErr, ok := err.(*pq.Error); ok && string(pqErr.Code) == "23505" {
				if strings.Contains(pqErr.Constraint, "email") {
					writeError(w, http.StatusConflict, "Email already registered")
				} else {
					writeError(w, http.StatusConflict, "Username already taken")
				}
				return
			}
			writeError(w, http.StatusInternalServerError, "Failed to create account")
			return
		}

		tokenStr, err := auth.GenerateToken(user.ID, user.Username)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to generate token")
			return
		}

		setTokenCookie(w, tokenStr)
		writeJSON(w, http.StatusCreated, models.AuthResponse{User: *user})
	}
}

func Login(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		req.Email = strings.TrimSpace(strings.ToLower(req.Email))

		user, passwordHash, err := store.GetUserByEmail(req.Email)
		if err != nil {
			if err == sql.ErrNoRows {
				writeError(w, http.StatusUnauthorized, "Invalid email or password")
				return
			}
			writeError(w, http.StatusInternalServerError, "Failed to look up user")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
			writeError(w, http.StatusUnauthorized, "Invalid email or password")
			return
		}

		tokenStr, err := auth.GenerateToken(user.ID, user.Username)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to generate token")
			return
		}

		setTokenCookie(w, tokenStr)
		writeJSON(w, http.StatusOK, models.AuthResponse{User: *user})
	}
}

func Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
	writeJSON(w, http.StatusOK, map[string]string{"message": "Logged out"})
}

func GetCurrentUser(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			writeError(w, http.StatusUnauthorized, "Not authenticated")
			return
		}

		user, err := store.GetUserByID(claims.UserID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to get user")
			return
		}

		writeJSON(w, http.StatusOK, models.AuthResponse{User: *user})
	}
}

func setTokenCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		MaxAge:   7 * 24 * 60 * 60,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}
