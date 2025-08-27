package main

import (
	"logic/questions"
	"fmt"
	"bufio"
	"os"
	"strconv"
	"strings"
)


func main() {
	reader := bufio.NewReader(os.Stdin)
	score := 0
	count := 0

	for {
		q := questions.Question{}
		//ops := []string{"+", "-", "*", "/", "%"}
		q.Generate_hard()
		fmt.Printf("What is %d %s %d? ", q.Num1, q.Operation, q.Num2)

		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)
		
		if input == "q" {
			fmt.Printf("Game ended. Final score: %d / %d ", score, count)
			break
		}
		userAnswer, err := strconv.Atoi(input)
		if err != nil {
			fmt.Println("Invalid input")
			continue // should prompt again
		}

		if userAnswer == q.Answer {
			fmt.Println("Correct!")
			score++
			count++
		} else {
			fmt.Println("Incorrect. Correct answer:", q.Answer)
			count++
		}
	}
}

// adding a comment here for a test
/*
func main() {
	q := questions.Question{}
	q.Generate_hard("-")
	fmt.Println(q.Num1, q.Operation, q.Num2, "= ")
	var answer int
	fmt.Scanf("%d", &answer)
	fmt.Println(answer == q.Answer)
}
*/
