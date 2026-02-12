package handlers

import (
	"encoding/json"
	"net/http"
	"refine-v2/api/internal/generator"
	"refine-v2/api/internal/models"
)

func ValidateAnswers(w http.ResponseWriter, r *http.Request) {
	var req models.ValidateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Seed == "" {
		writeError(w, http.StatusBadRequest, "Missing seed")
		return
	}
	if len(req.Answers) == 0 {
		writeError(w, http.StatusBadRequest, "No answers provided")
		return
	}

	problemCount := len(req.Answers)
	problems := generator.GenerateWithSeed(req.Seed, req.Mode, req.Difficulty, problemCount, req.Config)

	correct := 0
	for i, userAnswer := range req.Answers {
		if i < len(problems) && problems[i].Answer == userAnswer {
			correct++
		}
	}

	score := correct * 10

	writeJSON(w, http.StatusOK, models.ValidateResponse{
		Correct: correct,
		Total:   len(req.Answers),
		Score:   score,
	})
}
