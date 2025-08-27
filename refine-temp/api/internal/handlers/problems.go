package handlers

import (
    "encoding/json"
    "net/http"
    "refine-temp-api/internal/generator"
    "refine-temp-api/internal/models"
)

func HandleGenerateProblems(w http.ResponseWriter, r *http.Request) {
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
    
    var req models.GenerateRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
        return
    }
    
    if req.Count <= 0 {
        req.Count = 50
    }
    if req.Count > 200 {
        req.Count = 200 // cap at 200 problems
    }
    if req.Difficulty <= 0 || req.Difficulty > 4 {
        req.Difficulty = 1 // default to easy
    }
    if req.Mode == "" {
        req.Mode = "addition"
    }
    
    seed := generator.CreateSeed()
    problems := generator.GenerateWithSeed(seed, req.Mode, req.Difficulty, req.Count, req.Config)
    questions := generator.ConvertToQuestions(problems)
    
    response := models.GenerateResponse{
        Seed:     seed,
        Problems: questions,
    }
    
    if err := json.NewEncoder(w).Encode(response); err != nil {
        http.Error(w, `{"error":"Failed to encode response"}`, http.StatusInternalServerError)
        return
    }
}