package handlers

import (
	"net/http"
	"refine-v2/api/internal/database"
	"refine-v2/api/internal/models"
)

func GetUserStats(store *database.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			writeError(w, http.StatusUnauthorized, "Not authenticated")
			return
		}

		stats, err := store.GetUserStats(claims.UserID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Failed to get stats")
			return
		}

		recent, err := store.GetRecentGames(claims.UserID)
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
