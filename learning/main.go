package main

import (
	"fmt"
	"learning/questions"
)

func main() {
	q := questions.Question{}
	q.Generate_easy("+")
	fmt.Println(q)
}

