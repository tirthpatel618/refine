package database

import "database/sql"

func Migrate(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id            BIGSERIAL PRIMARY KEY,
			email         TEXT UNIQUE NOT NULL,
			username      TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			created_at    TIMESTAMPTZ DEFAULT now()
		)`,

		`CREATE TABLE IF NOT EXISTS game_sessions (
			id         BIGSERIAL PRIMARY KEY,
			user_id    BIGINT REFERENCES users(id),
			mode       TEXT NOT NULL,
			difficulty INT NOT NULL,
			score      INT NOT NULL,
			correct    INT NOT NULL,
			total      INT NOT NULL,
			time_limit INT NOT NULL,
			created_at TIMESTAMPTZ DEFAULT now()
		)`,

		`CREATE TABLE IF NOT EXISTS email_signups (
			id         BIGSERIAL PRIMARY KEY,
			email      TEXT UNIQUE NOT NULL,
			created_at TIMESTAMPTZ DEFAULT now()
		)`,

		`CREATE INDEX IF NOT EXISTS idx_game_sessions_leaderboard
			ON game_sessions(mode, difficulty, score DESC)`,

		`CREATE INDEX IF NOT EXISTS idx_game_sessions_user
			ON game_sessions(user_id, mode, difficulty)`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			return err
		}
	}

	return nil
}
