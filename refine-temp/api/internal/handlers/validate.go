package handlers

import (
    "encoding/json"
    "net/http"
    "refine-api/internal/generator"
    "refine-api/internal/models"
)

func HandleValidate(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    
    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusOK)
        return
    }
    
    if r.Method != "POST" {
        http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
        return
    }
    
    var req models.ValidateRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
        return
    }
    
    if req.Seed == "" {
        http.Error(w, `{"error":"Missing seed"}`, http.StatusBadRequest)
        return
    }
    
    if len(req.Answers) == 0 {
        http.Error(w, `{"error":"No answers provided"}`, http.StatusBadRequest)
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
    
    response := models.ValidateResponse{
        Correct:  correct,
        Total:    len(req.Answers),
        Score:    score,
    }
    
    if err := json.NewEncoder(w).Encode(response); err != nil {
        http.Error(w, `{"error":"Failed to encode response"}`, http.StatusInternalServerError)
        return
    }
}

