package handlers

import (
    "context"
    "database/sql"
    "encoding/json"
    "net/mail"
    "os"
    "time"
	"log"
	"fmt"

    "github.com/aws/aws-lambda-go/events"
    _ "github.com/lib/pq"
    "github.com/lib/pq" 
	//"github.com/aws/aws-sdk-go-v2/aws"
	//"github.com/aws/aws-sdk-go-v2/config"
	//"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

var db *sql.DB


func init() {
    if os.Getenv("SKIP_DB") == "1" {
        return
    }

    host := os.Getenv("DB_HOST") 
    name := os.Getenv("DB_NAME") 
    user := os.Getenv("DB_USER")
    pass := os.Getenv("DB_PASS")
    port := os.Getenv("DB_PORT")
    if port == "" {
        port = "5432"
    }

    if host == "" || name == "" || user == "" || pass == "" {
        println("DB init skipped: missing one of DB_HOST/DB_NAME/DB_USER/DB_PASS")
        return
    }

    dsn := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=require connect_timeout=3",
        host, port, user, pass, name,
    )

    openDB(dsn)

    if err := dbHealthAndMigrate(); err != nil {
        log.Printf("DB health/migrate failed: %v", err)
    }
}

func dbHealthAndMigrate() error {
    if db == nil {
        return fmt.Errorf("db is nil")
    }
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()

    if err := db.PingContext(ctx); err != nil {
        return fmt.Errorf("db ping failed: %w", err)
    }

    _, err := db.ExecContext(ctx, `
        CREATE TABLE IF NOT EXISTS public.email_signups (
            id BIGSERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `)
    if err != nil {
        return fmt.Errorf("create table failed: %w", err)
    }
    return nil
}
/*

for when I can get the secret manager to work
type rdsManagedSecret struct {
	Username             string `json:"username"`
	Password             string `json:"password"`
	Engine               string `json:"engine"`
	DBInstanceIdentifier string `json:"dbInstanceIdentifier"`
	ResourceId           string `json:"resourceId"`
}

func init() {
	secretName := os.Getenv("DB_SECRET_ID")
	region   := os.Getenv("AWS_REGION") 
	host := os.Getenv("DB_HOST")          
	name := os.Getenv("DB_NAME")          
	port := os.Getenv("DB_PORT")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	config, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	if err != nil {
		log.Fatal(err)
	}

	svc := secretsmanager.NewFromConfig(config)

	input := &secretsmanager.GetSecretValueInput{
		SecretId:     aws.String(secretName),
		VersionStage: aws.String("AWSCURRENT"), // VersionStage defaults to AWSCURRENT if unspecified
	}

	result, err := svc.GetSecretValue(context.TODO(), input)
	if err != nil {
		// For a list of exceptions thrown, see
		// https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
		log.Fatal(err.Error())
	}

	var sec rdsManagedSecret
	if err := json.Unmarshal([]byte(*result.SecretString), &sec); err != nil {
		println("secret json parse failed:", err.Error())
		return
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=require connect_timeout=3",
		host, port, sec.Username, sec.Password, name,
	)
	openDB(dsn)

    if err = createEmailTable(); err != nil {
        println("Failed to create email table:", err.Error())
    }
}
*/
func openDB(dsn string) {
	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		println("sql.Open failed:", err.Error())
		return
	}
	db.SetMaxOpenConns(5)
	db.SetMaxIdleConns(5)
	db.SetConnMaxIdleTime(5 * time.Minute)
	db.SetConnMaxLifetime(30 * time.Minute)
}



type EmailRequest struct {
    Email string `json:"email"`
}

type EmailResponse struct {
    Message string `json:"message"`
    Success bool   `json:"success"`
}

func HandleEmailSignup(req events.APIGatewayProxyRequest, headers map[string]string) (events.APIGatewayProxyResponse, error) {
    var body EmailRequest
    if err := json.Unmarshal([]byte(req.Body), &body); err != nil || body.Email == "" {
        return events.APIGatewayProxyResponse{StatusCode: 400, Headers: headers, Body: `{"error":"invalid body"}`}, nil
    }
    if _, err := mail.ParseAddress(body.Email); err != nil {
        return events.APIGatewayProxyResponse{StatusCode: 422, Headers: headers, Body: `{"error":"invalid email"}`}, nil
    }

    if db == nil {
        // soft accept if DB not configured
        resp := EmailResponse{Message: "Thanks! We'll notify you when Refine launches.", Success: true}
        b, _ := json.Marshal(resp)
        return events.APIGatewayProxyResponse{StatusCode: 200, Headers: headers, Body: string(b)}, nil
    }

    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()

    _, err := db.ExecContext(ctx, `INSERT INTO public.email_signups (email) VALUES ($1)`, body.Email)
    if err != nil {
        // Duplicate?
        if pqErr, ok := err.(*pq.Error); ok && string(pqErr.Code) == "23505" {
            resp := EmailResponse{Message: "Email already registered.", Success: false}
            b, _ := json.Marshal(resp)
            return events.APIGatewayProxyResponse{StatusCode: 200, Headers: headers, Body: string(b)}, nil
        }
        log.Printf("db insert failed: %v", err)

        if os.Getenv("DEBUG") == "1" {
            return events.APIGatewayProxyResponse{StatusCode: 500, Headers: headers, Body: `{"error":"db insert failed: ` + escape(err.Error()) + `"}`}, nil
        }
        return events.APIGatewayProxyResponse{StatusCode: 500, Headers: headers, Body: `{"error":"db insert failed"}`}, nil
    }

    resp := EmailResponse{Message: "Successfully signed up! We'll notify you when Refine launches.", Success: true}
    b, _ := json.Marshal(resp)
    return events.APIGatewayProxyResponse{StatusCode: 201, Headers: headers, Body: string(b)}, nil
}


func escape(s string) string {
    bs, _ := json.Marshal(s)
    // bs like: "text", strip quotes
    if len(bs) >= 2 {
        return string(bs[1:len(bs)-1])
    }
    return s
}