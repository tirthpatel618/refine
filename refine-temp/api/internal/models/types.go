package models

type GenerateRequest struct {
	Mode string `json:"mode"`
	Difficulty int `json:"Difficulty"`
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


type ValidateRequest struct {
    Seed       string        `json:"seed"`
    Mode       string        `json:"mode"`
    Difficulty int        `json:"difficulty"`
    Config     *CustomConfig `json:"config,omitempty"`
    Answers    []int         `json:"answers"`
}

type ValidateResponse struct {
    Correct  int     `json:"correct"`
    Total    int     `json:"total"`
    Score    int     `json:"score"`
}




