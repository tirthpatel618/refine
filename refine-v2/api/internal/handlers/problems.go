package handlers

import (
	"encoding/json"
	"net/http"
	"refine-v2/api/internal/generator"
	"refine-v2/api/internal/models"
)

func GenerateProblems(w http.ResponseWriter, r *http.Request) {
	var req models.GenerateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Count <= 0 {
		req.Count = 50
	}
	if req.Count > 200 {
		req.Count = 200
	}
	if req.Difficulty <= 0 || req.Difficulty > 4 {
		req.Difficulty = 1
	}
	if req.Mode == "" {
		req.Mode = "addition"
	}

	seed := generator.CreateSeed()
	problems := generator.GenerateWithSeed(seed, req.Mode, req.Difficulty, req.Count, req.Config)
	questions := generator.ConvertToQuestions(problems)

	writeJSON(w, http.StatusOK, models.GenerateResponse{
		Seed:     seed,
		Problems: questions,
	})
}
