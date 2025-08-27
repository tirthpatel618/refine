package models


type GenerateRequest struct {
	Mode string `json:"mode"`
	Level int `json:"level"`
	Count int `json:"count"`
	Config     *CustomConfig `json:"config,omitempty"`
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



