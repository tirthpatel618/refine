package database

import (
	"context"
	"database/sql"
	"refine-v2/backend/internal/models"
	"time"
)

type Store struct {
	DB *sql.DB
}

func NewStore(db *sql.DB) *Store {
	return &Store{DB: db}
}

func (s *Store) ctx() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 5*time.Second)
}

// --- Users ---

func (s *Store) CreateUser(email, username, passwordHash string) (*models.User, error) {
	ctx, cancel := s.ctx()
	defer cancel()

	var user models.User
	err := s.DB.QueryRowContext(ctx,
		`INSERT INTO users (email, username, password_hash)
		 VALUES ($1, $2, $3)
		 RETURNING id, email, username, created_at`,
		email, username, passwordHash,
	).Scan(&user.ID, &user.Email, &user.Username, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *Store) GetUserByEmail(email string) (*models.User, string, error) {
	ctx, cancel := s.ctx()
	defer cancel()

	var user models.User
	var passwordHash string
	err := s.DB.QueryRowContext(ctx,
		`SELECT id, email, username, password_hash, created_at
		 FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.Username, &passwordHash, &user.CreatedAt)
	if err != nil {
		return nil, "", err
	}
	return &user, passwordHash, nil
}

func (s *Store) GetUserByID(id int64) (*models.User, error) {
	ctx, cancel := s.ctx()
	defer cancel()

	var user models.User
	err := s.DB.QueryRowContext(ctx,
		`SELECT id, email, username, created_at
		 FROM users WHERE id = $1`,
		id,
	).Scan(&user.ID, &user.Email, &user.Username, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *Store) GetPasswordHash(userID int64) (string, error) {
	ctx, cancel := s.ctx()
	defer cancel()

	var hash string
	err := s.DB.QueryRowContext(ctx,
		`SELECT password_hash FROM users WHERE id = $1`, userID,
	).Scan(&hash)
	return hash, err
}

func (s *Store) UpdatePassword(userID int64, newHash string) error {
	ctx, cancel := s.ctx()
	defer cancel()

	_, err := s.DB.ExecContext(ctx,
		`UPDATE users SET password_hash = $1 WHERE id = $2`, newHash, userID)
	return err
}

func (s *Store) UpdateUsername(userID int64, newUsername string) error {
	ctx, cancel := s.ctx()
	defer cancel()

	_, err := s.DB.ExecContext(ctx,
		`UPDATE users SET username = $1 WHERE id = $2`, newUsername, userID)
	return err
}

func (s *Store) DeleteUser(userID int64) error {
	ctx, cancel := s.ctx()
	defer cancel()

	// Delete game sessions first (FK constraint)
	if _, err := s.DB.ExecContext(ctx,
		`DELETE FROM game_sessions WHERE user_id = $1`, userID); err != nil {
		return err
	}
	_, err := s.DB.ExecContext(ctx,
		`DELETE FROM users WHERE id = $1`, userID)
	return err
}

// --- Email signups ---

func (s *Store) InsertEmail(email string) error {
	ctx, cancel := s.ctx()
	defer cancel()

	_, err := s.DB.ExecContext(ctx,
		`INSERT INTO email_signups (email) VALUES ($1)`, email)
	return err
}

// --- Game sessions ---

func (s *Store) SaveGameSession(userID int64, req models.SaveSessionRequest) error {
	ctx, cancel := s.ctx()
	defer cancel()

	_, err := s.DB.ExecContext(ctx,
		`INSERT INTO game_sessions (user_id, mode, difficulty, score, correct, total, time_limit)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		userID, req.Mode, req.Difficulty, req.Score, req.Correct, req.Total, req.TimeLimit,
	)
	return err
}

// --- Leaderboard ---

func (s *Store) GetGlobalLeaderboard(mode string, difficulty int, timeLimit int) ([]models.LeaderboardEntry, error) {
	ctx, cancel := s.ctx()
	defer cancel()

	rows, err := s.DB.QueryContext(ctx,
		`SELECT u.username, gs.score, gs.correct, gs.total, gs.time_limit, gs.created_at
		 FROM game_sessions gs
		 JOIN users u ON u.id = gs.user_id
		 WHERE gs.mode = $1 AND gs.difficulty = $2 AND gs.time_limit = $3
		 ORDER BY gs.score DESC
		 LIMIT 5`,
		mode, difficulty, timeLimit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []models.LeaderboardEntry
	rank := 1
	for rows.Next() {
		var e models.LeaderboardEntry
		if err := rows.Scan(&e.Username, &e.Score, &e.Correct, &e.Total, &e.TimeLimit, &e.PlayedAt); err != nil {
			return nil, err
		}
		e.Rank = rank
		rank++
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

func (s *Store) GetPersonalLeaderboard(userID int64, mode string, difficulty int, timeLimit int) ([]models.LeaderboardEntry, error) {
	ctx, cancel := s.ctx()
	defer cancel()

	rows, err := s.DB.QueryContext(ctx,
		`SELECT score, correct, total, time_limit, created_at
		 FROM game_sessions
		 WHERE user_id = $1 AND mode = $2 AND difficulty = $3 AND time_limit = $4
		 ORDER BY score DESC
		 LIMIT 5`,
		userID, mode, difficulty, timeLimit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []models.LeaderboardEntry
	rank := 1
	for rows.Next() {
		var e models.LeaderboardEntry
		if err := rows.Scan(&e.Score, &e.Correct, &e.Total, &e.TimeLimit, &e.PlayedAt); err != nil {
			return nil, err
		}
		e.Rank = rank
		rank++
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

// --- Stats ---

func (s *Store) GetUserStats(userID int64, difficulty int) ([]models.ModeStat, error) {
	ctx, cancel := s.ctx()
	defer cancel()

	rows, err := s.DB.QueryContext(ctx,
		`SELECT mode,
			COUNT(*) as games_played,
			MAX(score) as best_score,
			ROUND(AVG(score)::numeric, 1) as avg_score,
			ROUND(AVG(correct::numeric / NULLIF(total, 0) * 100)::numeric, 1) as avg_accuracy
		 FROM game_sessions
		 WHERE user_id = $1 AND difficulty = $2
		 GROUP BY mode
		 ORDER BY mode`,
		userID, difficulty,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []models.ModeStat
	for rows.Next() {
		var s models.ModeStat
		if err := rows.Scan(&s.Mode, &s.GamesPlayed, &s.BestScore, &s.AvgScore, &s.AvgAccuracy); err != nil {
			return nil, err
		}
		s.Difficulty = difficulty
		stats = append(stats, s)
	}
	return stats, rows.Err()
}

// GetRecentGames returns last 10 games, optionally filtered by mode.
func (s *Store) GetRecentGames(userID int64, mode string) ([]models.GameSessionRecord, error) {
	ctx, cancel := s.ctx()
	defer cancel()

	var query string
	var args []any

	if mode != "" {
		query = `SELECT id, mode, difficulty, score, correct, total, time_limit, created_at
			FROM game_sessions
			WHERE user_id = $1 AND mode = $2
			ORDER BY created_at DESC
			LIMIT 10`
		args = []any{userID, mode}
	} else {
		query = `SELECT id, mode, difficulty, score, correct, total, time_limit, created_at
			FROM game_sessions
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT 10`
		args = []any{userID}
	}

	rows, err := s.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var games []models.GameSessionRecord
	for rows.Next() {
		var g models.GameSessionRecord
		if err := rows.Scan(&g.ID, &g.Mode, &g.Difficulty, &g.Score, &g.Correct, &g.Total, &g.TimeLimit, &g.PlayedAt); err != nil {
			return nil, err
		}
		games = append(games, g)
	}
	return games, rows.Err()
}
