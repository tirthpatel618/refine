package handlers

import (
	"net/http"
	"refine-v2/backend/internal/database"
	"refine-v2/backend/internal/models"
	"strconv"
)

func GetUserStats(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			writeError(w, http.StatusUnauthorized, "Not authenticated")
			return
		}

		// Difficulty filter for stats (defaults to 1/easy)
		difficulty := 1
		if d := r.URL.Query().Get("difficulty"); d != "" {
			if parsed, err := strconv.Atoi(d); err == nil && parsed >= 1 && parsed <= 3 {
				difficulty = parsed
			}
		}

		// Mode filter for recent games (optional)
		modeFilter := r.URL.Query().Get("mode")

		stats, err := store.GetUserStats(claims.UserID, difficulty)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to get stats")
			return
		}

		recent, err := store.GetRecentGames(claims.UserID, modeFilter)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to get recent games")
			return
		}

		if stats == nil {
			stats = []models.ModeStat{}
		}
		if recent == nil {
			recent = []models.GameSessionRecord{}
		}

		writeJSON(w, http.StatusOK, models.StatsResponse{
			Stats:       stats,
			RecentGames: recent,
		})
	}
}
