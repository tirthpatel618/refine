package generator

import (
	"math/rand"
	"refine-v2/backend/internal/models"
)

func generateAddition(rng *rand.Rand, min, max, id int) models.Problem {
	num1 := rng.Intn(max-min+1) + min
	num2 := rng.Intn(max-min+1) + min

	return models.Problem{
		ID:       id,
		Num1:     num1,
		Operator: "+",
		Num2:     num2,
		Answer:   num1 + num2,
	}
}

func generateSubtraction(rng *rand.Rand, min, max, id int) models.Problem {
	num1 := rng.Intn(max-min+1) + min
	num2 := rng.Intn(max-min+1) + min

	if num1 < num2 {
		num1, num2 = num2, num1
	}

	return models.Problem{
		ID:       id,
		Num1:     num1,
		Operator: "-",
		Num2:     num2,
		Answer:   num1 - num2,
	}
}

func generateMultiplication(rng *rand.Rand, min, max, id int) models.Problem {
	num1 := rng.Intn(max-min+1) + min
	num2 := rng.Intn(max-min+1) + min

	return models.Problem{
		ID:       id,
		Num1:     num1,
		Operator: "\u00d7",
		Num2:     num2,
		Answer:   num1 * num2,
	}
}

func generateDivision(rng *rand.Rand, min, max, id int) models.Problem {
	num1 := rng.Intn(max-min+1) + min
	num2 := rng.Intn(max-min+1) + min + 1

	if num1 == num2 {
		return generateDivision(rng, min, max, id)
	}

	if num1 < num2 {
		num1, num2 = num2, num1
	}

	num1 -= num1 % num2

	if num1 == num2 {
		return generateDivision(rng, min, max, id)
	}

	return models.Problem{
		ID:       id,
		Num1:     num1,
		Operator: "\u00f7",
		Num2:     num2,
		Answer:   num1 / num2,
	}
}
