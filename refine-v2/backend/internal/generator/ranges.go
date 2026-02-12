package generator

type Range struct {
	Min int
	Max int
}

var Division = map[int]Range{
	1: {Min: 2, Max: 100},
	2: {Min: 2, Max: 1000},
	3: {Min: 3, Max: 10000},
}

var Multiplication = map[int]Range{
	1: {Min: 2, Max: 10},
	2: {Min: 2, Max: 100},
	3: {Min: 3, Max: 1000},
}

var Addition = map[int]Range{
	1: {Min: 1, Max: 100},
	2: {Min: 10, Max: 1000},
	3: {Min: 50, Max: 10000},
}

var Subtraction = map[int]Range{
	1: {Min: 1, Max: 100},
	2: {Min: 10, Max: 1000},
	3: {Min: 50, Max: 10000},
}
