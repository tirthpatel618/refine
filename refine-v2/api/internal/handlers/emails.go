package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"net/mail"
	"refine-v2/api/internal/database"
	"refine-v2/api/internal/models"
	"strings"

	"github.com/lib/pq"
)

func EmailSignup(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.EmailRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
			writeError(w, http.StatusBadRequest, "Invalid body")
			return
		}

		req.Email = strings.TrimSpace(strings.ToLower(req.Email))

		if _, err := mail.ParseAddress(req.Email); err != nil {
			writeError(w, http.StatusUnprocessableEntity, "Invalid email")
			return
		}

		err := store.InsertEmail(req.Email)
		if err != nil {
			if pqErr, ok := err.(*pq.Error); ok && string(pqErr.Code) == "23505" {
				writeJSON(w, http.StatusOK, models.EmailResponse{
					Message: "Email already registered.",
					Success: false,
				})
				return
			}
			log.Printf("db insert failed: %v", err)
			writeError(w, http.StatusInternalServerError, "Failed to save email")
			return
		}

		writeJSON(w, http.StatusCreated, models.EmailResponse{
			Message: "Successfully signed up! We'll notify you when Refine launches.",
			Success: true,
		})
	}
}
