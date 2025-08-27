package main

import (
	"encoding/json"
	"log"
	"net/http"
	"math/rand"
	"github.com/gorilla/mux"
)

type Question struct {
	Level     int
	Num1      int
	Num2      int
	Operation string
	Answer    int
}



type QuestionResponse struct {
	Num1      int
	Num2      int
	Answer    int
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/questions", getQuestions).Methods("GET")
	router.HandleFunc("/questions", validateQuestions).Methods("POST")
	log.Fatal(http.ListenAndServe(":8080", router))

}

func getQuestions(w http.ResponseWriter, r *http.Request) {
	q := Question{}
	q.Level = 3
	q.Num1 = rand.Intn(1000) + 1
	q.Num2 = rand.Intn(1000) + 1
	q.Operation = "+"
	q.Answer = q.Num1 + q.Num2
	b, err := json.Marshal(q)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(b)
}

func validateQuestions(w http.ResponseWriter, r *http.Request) {
	var q QuestionResponse
	err := json.NewDecoder(r.Body).Decode(&q)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if q.Answer == q.Num1+q.Num2 {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Correct"))
	} else {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Incorrect"))
	}
}

