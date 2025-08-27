package generator

import (
	"refine-temp-api/internal/models"
	"math/rand"
	"fmt"
	"time"
	"hash/fnv"

)

func CreateSeed() string {
    return fmt.Sprintf("%d-%d", time.Now().UnixNano(), rand.Int())
}

func GenerateWithSeed(seed string, mode string, difficulty int, count int, config *models.CustomConfig) []models.Problem {
    h := fnv.New64a()
    h.Write([]byte(seed))
    seedNum := int64(h.Sum64())
    rng := rand.New(rand.NewSource(seedNum))
    
    min, max := getRangeForDifficulty(difficulty, mode, config)
    
    problems := make([]models.Problem, count)
    
    generatorFunc := getOperationFunc(mode)
    
    for i := 0; i < count; i++ {
        problems[i] = generatorFunc(rng, min, max, i)
    }
    
    return problems
}

func ConvertToQuestions(problems []models.Problem) []models.Question {
    questions := make([]models.Question, len(problems))
    for i, p := range problems {
        questions[i] = models.Question{
            ID:       p.ID,
            Num1:     p.Num1,
            Operator: p.Operator,
            Num2:     p.Num2,
        }
    }
    return questions
}

func getRangeForDifficulty(difficulty int, operator string, config *models.CustomConfig) (int, int) {
    if config != nil && config.Min > 0 && config.Max > 0 {
        return config.Min, config.Max
    }
    
    switch operator {
		case "+":
			return Addition[difficulty].Min, Addition[difficulty].Max
		case "-":
			return Subtraction[difficulty].Min, Subtraction[difficulty].Max
		case "×":
			return Multiplication[difficulty].Min, Multiplication[difficulty].Max
		case "÷":
			return Division[difficulty].Min, Division[difficulty].Max
		default:
			return 0, 0
	}
}

func getOperationFunc(mode string) func(*rand.Rand, int, int, int) models.Problem {
    switch mode {
    case "subtraction":
        return generateSubtraction
    case "multiplication":
        return generateMultiplication
    case "division":
        return generateDivision
    default: // addition
        return generateAddition
    }
}














