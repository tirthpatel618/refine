package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"refine-v2/backend/internal/auth"
	"refine-v2/backend/internal/database"
	"refine-v2/backend/internal/handlers"
)

func main() {
	// Required env vars
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}
	auth.SetSecret(jwtSecret)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Secure cookies only over HTTPS (disable for local dev)
	handlers.SetSecureCookies(strings.HasPrefix(frontendURL, "https"))

	// Database
	db, err := database.Connect(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}
	log.Println("Database connected and migrated")

	store := database.NewStore(db)

	// Router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{frontendURL},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Origin", "Accept"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Public routes
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"healthy"}`))
	})

	r.Post("/api/problems", handlers.GenerateProblems)
	r.Post("/api/validate", handlers.ValidateAnswers)
	r.Post("/emails", handlers.EmailSignup(store))

	// Auth routes (public)
	r.Post("/api/auth/signup", handlers.Signup(store))
	r.Post("/api/auth/login", handlers.Login(store))
	r.Post("/api/auth/logout", handlers.Logout)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(handlers.AuthMiddleware)

		r.Get("/api/auth/me", handlers.GetCurrentUser(store))
		r.Post("/api/sessions", handlers.SaveGameSession(store))
		r.Get("/api/stats", handlers.GetUserStats(store))
		r.Get("/api/leaderboard", handlers.GetLeaderboard(store))
	})

	log.Printf("Server starting on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
