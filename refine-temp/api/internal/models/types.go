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

type Problem struct {
	Num1 int 
	Num2 int 
	Operation string 
	Answer int 
}



