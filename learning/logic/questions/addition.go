package questions

// specifically for addition


import (
	"math/rand"
)

func (q *Question) Generate_easy() {
	q.Level = 1
	q.Num1 = rand.Intn(19) + 1
	q.Num2 = rand.Intn(19) + 1
	q.Operation = "+"
	q.Answer = get_answer(q.Operation, q.Num1, q.Num2)
}

func (q *Question) Generate_medium() {
	min := 50
	max := 100
	q.Level = 2
	q.Num1 = rand.Intn(100) + 1
	q.Num2 = rand.Intn(max-min+1) + min
	q.Operation = "+"
	q.Answer = get_answer(q.Operation, q.Num1, q.Num2)
}

func (q *Question) Generate_hard() {
	min1 := 500
	min2 := 300
	max := 1000
	q.Level = 3
	q.Num1 = rand.Intn(max-min1+1) + min1
	q.Num2 = rand.Intn(max-min2+1) + min2
	q.Operation = "+"
	q.Answer = get_answer(q.Operation, q.Num1, q.Num2)
}