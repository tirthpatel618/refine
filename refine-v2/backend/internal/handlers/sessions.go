package handlers

import (
	"encoding/json"
	"net/http"
	"refine-v2/backend/internal/database"
	"refine-v2/backend/internal/models"
)

var validModes = map[string]bool{
	"addition":       true,
	"subtraction":    true,
	"multiplication": true,
	"division":       true,
	"mixed":          true,
}

func SaveGameSession(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			writeError(w, http.StatusUnauthorized, "Not authenticated")
			return
		}

		var req models.SaveSessionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if !validModes[req.Mode] {
			writeError(w, http.StatusBadRequest, "Invalid mode")
			return
		}
		if req.Difficulty < 1 || req.Difficulty > 3 {
			writeError(w, http.StatusBadRequest, "Difficulty must be 1, 2, or 3")
			return
		}

		if err := store.SaveGameSession(claims.UserID, req); err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to save session")
			return
		}

		writeJSON(w, http.StatusCreated, map[string]string{"message": "Session saved"})
	}
}
