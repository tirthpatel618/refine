package handlers

import (
	"net/http"
	"refine-v2/backend/internal/database"
	"refine-v2/backend/internal/models"
	"strconv"
)

func GetLeaderboard(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			writeError(w, http.StatusUnauthorized, "Not authenticated")
			return
		}

		mode := r.URL.Query().Get("mode")
		diffStr := r.URL.Query().Get("difficulty")
		timeLimitStr := r.URL.Query().Get("time_limit")

		if !validModes[mode] {
			writeError(w, http.StatusBadRequest, "Invalid mode")
			return
		}

		difficulty, err := strconv.Atoi(diffStr)
		if err != nil || difficulty < 1 || difficulty > 3 {
			writeError(w, http.StatusBadRequest, "Difficulty must be 1, 2, or 3")
			return
		}

		timeLimit, err := strconv.Atoi(timeLimitStr)
		if err != nil || timeLimit <= 0 {
			writeError(w, http.StatusBadRequest, "Invalid time_limit")
			return
		}

		global, err := store.GetGlobalLeaderboard(mode, difficulty, timeLimit)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to get leaderboard")
			return
		}

		personal, err := store.GetPersonalLeaderboard(claims.UserID, mode, difficulty, timeLimit)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to get personal scores")
			return
		}

		if global == nil {
			global = []models.LeaderboardEntry{}
		}
		if personal == nil {
			personal = []models.LeaderboardEntry{}
		}

		writeJSON(w, http.StatusOK, models.LeaderboardResponse{
			Global:   global,
			Personal: personal,
		})
	}
}
