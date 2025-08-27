package models

type GenerateRequest struct {
	Mode string `json:"mode"`
	Difficulty int `json:"level"`
	Count int `json:"count"`
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

//different for whats sent to frontend (without answer to be validated later)
type Question struct {
	ID	int
	Num1 int 
	Num2 int 
	Operator string 
}

type Problem struct {
    ID       int
    Num1     int
    Operator string
    Num2     int
    Answer   int
}

type ValidateRequest struct {
    Seed       string        `json:"seed"`
    Mode       string        `json:"mode"`
    Difficulty string        `json:"difficulty"`
    Config     *CustomConfig `json:"config,omitempty"`
    Answers    []int         `json:"answers"`
}

type ValidateResponse struct {
    Correct  int     `json:"correct"`
    Total    int     `json:"total"`
    Score    int     `json:"score"`
}



