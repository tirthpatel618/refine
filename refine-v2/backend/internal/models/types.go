package models

import "time"

// --- Problem generation ---

type GenerateRequest struct {
	Mode       string        `json:"mode"`
	Difficulty int           `json:"difficulty"`
	Count      int           `json:"count"`
	Config     *CustomConfig `json:"config,omitempty"`
}

type GenerateResponse struct {
	Seed     string     `json:"seed"`
	Problems []Question `json:"problems"`
}

type CustomConfig struct {
	Min int `json:"min"`
	Max int `json:"max"`
}

type Question struct {
	ID       int    `json:"id"`
	Num1     int    `json:"num1"`
	Operator string `json:"operator"`
	Num2     int    `json:"num2"`
}

type Problem struct {
	ID       int    `json:"id"`
	Num1     int    `json:"num1"`
	Operator string `json:"operator"`
	Num2     int    `json:"num2"`
	Answer   int    `json:"answer"`
}

// --- Validation ---

type ValidateRequest struct {
	Seed       string        `json:"seed"`
	Mode       string        `json:"mode"`
	Difficulty int           `json:"difficulty"`
	Config     *CustomConfig `json:"config,omitempty"`
	Answers    []int         `json:"answers"`
}

type ValidateResponse struct {
	Correct int `json:"correct"`
	Total   int `json:"total"`
	Score   int `json:"score"`
}

// --- Auth ---

type SignupRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type User struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"created_at"`
}

type AuthResponse struct {
	User User `json:"user"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

type ChangeUsernameRequest struct {
	Username string `json:"username"`
}

// --- Email signup ---

type EmailRequest struct {
	Email string `json:"email"`
}

type EmailResponse struct {
	Message string `json:"message"`
	Success bool   `json:"success"`
}

// --- Game sessions ---

type SaveSessionRequest struct {
	Mode       string `json:"mode"`
	Difficulty int    `json:"difficulty"`
	Score      int    `json:"score"`
	Correct    int    `json:"correct"`
	Total      int    `json:"total"`
	TimeLimit  int    `json:"time_limit"`
}

type GameSessionRecord struct {
	ID         int64     `json:"id"`
	Mode       string    `json:"mode"`
	Difficulty int       `json:"difficulty"`
	Score      int       `json:"score"`
	Correct    int       `json:"correct"`
	Total      int       `json:"total"`
	TimeLimit  int       `json:"time_limit"`
	PlayedAt   time.Time `json:"played_at"`
}

// --- Leaderboard ---

type LeaderboardEntry struct {
	Rank      int       `json:"rank"`
	Username  string    `json:"username,omitempty"`
	Score     int       `json:"score"`
	Correct   int       `json:"correct"`
	Total     int       `json:"total"`
	TimeLimit int       `json:"time_limit"`
	PlayedAt  time.Time `json:"played_at"`
}

type LeaderboardResponse struct {
	Global   []LeaderboardEntry `json:"global"`
	Personal []LeaderboardEntry `json:"personal"`
}

// --- Stats ---

type ModeStat struct {
	Mode        string  `json:"mode"`
	Difficulty  int     `json:"difficulty"`
	GamesPlayed int     `json:"games_played"`
	BestScore   int     `json:"best_score"`
	AvgScore    float64 `json:"avg_score"`
	AvgAccuracy float64 `json:"avg_accuracy"`
}

type StatsResponse struct {
	Stats       []ModeStat          `json:"stats"`
	RecentGames []GameSessionRecord `json:"recent_games"`
}
