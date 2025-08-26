package questions

import (
	//"math/rand"
)

type Question struct {
	Level     int
	Num1      int
	Num2      int
	Operation string
	Answer    int
}

func get_answer(op string, num1 int, num2 int) int {
	switch op {
	case "+":
		return num1 + num2
	case "-":
		return num1 - num2
	case "*":
		return num1 * num2
	case "/":
		return num1 / num2
	case "%":
		return num1 % num2
	}
	return 0
}

/*
func (q *Question) Generate_easy(op string) {
	q.Level = 1
	// to avoid any 0
	q.Num1 = rand.Intn(19) + 1
	q.Num2 = rand.Intn(19) + 1
	q.Operation = op
	q.Answer = get_answer(op, q.Num1, q.Num2)
}

// probably will have to change per op type (easy in addition is different from easy in multiplication)
func (q *Question) Generate_medium(op string) {
	q.Level = 2
	q.Num1 = rand.Intn(100) + 1
	q.Num2 = rand.Intn(100) + 1
	q.Operation = op
	q.Answer = get_answer(op, q.Num1, q.Num2)
}

func (q *Question) Generate_hard(op string) {
	q.Level = 3
	q.Num1 = rand.Intn(1000) + 1
	q.Num2 = rand.Intn(1000) + 1
	q.Operation = op
	q.Answer = get_answer(op, q.Num1, q.Num2)
}
*/