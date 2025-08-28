package generator

import (
	"math/rand"
	"refine-temp-api/internal/models"
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
        Operator: "×",
        Num2:     num2,
        Answer:   num1 * num2,
    }
}


//probably will have to iterate over this after to make it better. Really only hard if the dividend is smaller and the divisor is large
func generateDivision(rng *rand.Rand, min, max, id int) models.Problem {
	num1 := rng.Intn(max-min+1) + min
	num2 := rng.Intn(max-min+1) + min + 1 // to avoid division by zero	

	// if both numbers are the same, regenerate
	if num1 == num2 {
		return generateDivision(rng, min, max, id)
	}

	// ensure that the smaller number is the divisor
	if num1 < num2 {
		num1, num2 = num2, num1
	}

	// adjust num1 to be a multiple of num2
	num1 -= num1 % num2
	 
	if num1 == num2 {
		return generateDivision(rng, min, max, id)
	}

	return models.Problem{
		ID:       id,
		Num1:     num1,
		Operator: "÷",
		Num2:     num2,
		Answer:   num1 / num2,
	}
}