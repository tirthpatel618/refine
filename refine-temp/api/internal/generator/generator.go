package generator

import (
	"refine-temp-api/internal/models"
	"math/rand"
	"fmt"
	"time"
)

func CreateSeed() string {
    return fmt.Sprintf("%d-%d", time.Now().UnixNano(), rand.Int())
}










