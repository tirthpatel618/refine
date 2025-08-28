package main

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"refine-temp-api/internal/handlers"
)

var corsHeaders = map[string]string{
	"Content-Type":                "application/json",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods":"GET,POST,OPTIONS",
	"Access-Control-Allow-Headers":"Content-Type,Authorization,Origin,Accept",
}

func router(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if strings.EqualFold(req.HTTPMethod, "OPTIONS") {
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    corsHeaders,
			Body:       `{"ok":true}`,
		}, nil
	}

	path := req.Path
	if stg := req.RequestContext.Stage; stg != "" {
		prefix := "/" + stg
		if strings.HasPrefix(path, prefix) {
			path = strings.TrimPrefix(path, prefix)
			if path == "" {
				path = "/"
			}
		}
	}

	switch {
	case path == "/api/problems" && strings.EqualFold(req.HTTPMethod, "POST"):
		return handlers.HandleGenerateProblems(req, corsHeaders)

	case path == "/api/validate" && strings.EqualFold(req.HTTPMethod, "POST"):
		return handlers.HandleValidate(req, corsHeaders)

	case path == "/health" && strings.EqualFold(req.HTTPMethod, "GET"):
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    corsHeaders,
			Body:       `{"status":"healthy"}`,
		}, nil

	case path == "/" && strings.EqualFold(req.HTTPMethod, "GET"):
		body, _ := json.Marshal(map[string]any{
			"service":   "refine-temp API",
			"endpoints": []string{"POST /api/problems", "POST /api/validate", "GET /health"},
		})
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    corsHeaders,
			Body:       string(body),
		}, nil

	default:
		return events.APIGatewayProxyResponse{
			StatusCode: 404,
			Headers:    corsHeaders,
			Body:       `{"error":"Not Found"}`,
		}, nil
	}
}

func main() {
	lambda.Start(router)
}
