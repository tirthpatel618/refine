package main

import (
    // "fmt"
    "log"
    "net/http"
    "refine-temp-api/internal/handlers"
)

func main() {

    http.HandleFunc("/api/problems", handlers.HandleGenerateProblems)
    http.HandleFunc("/api/validate", handlers.HandleValidate)
    
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.Write([]byte(`{"status":"healthy"}`))
    })
    
    // root endpoint
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path != "/" {
            http.NotFound(w, r)
            return
        }
        w.Header().Set("Content-Type", "application/json")
        w.Write([]byte(`{
            "service": "refine-temp API",
            "endpoints": [
                "POST /api/problems",
                "POST /api/validate",
                "GET /health"
            ]
        }`))
    })
    
    port := "8080"

    
    log.Fatal(http.ListenAndServe(":"+port, nil))
}

