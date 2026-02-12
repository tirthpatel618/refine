#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
EC2_HOST="${EC2_HOST:?Set EC2_HOST (e.g. ubuntu@1.2.3.4)}"
REMOTE_DIR="/opt/refine"

echo "==> Building ARM64 binary..."
cd "$(dirname "$0")/../backend"
GOOS=linux GOARCH=arm64 go build -o ../deploy/refine-api ./cmd/server

echo "==> Uploading binary to $EC2_HOST..."
scp ../deploy/refine-api "$EC2_HOST:$REMOTE_DIR/refine-api.new"

echo "==> Swapping binary and restarting service..."
ssh "$EC2_HOST" "sudo mv $REMOTE_DIR/refine-api.new $REMOTE_DIR/refine-api && sudo chmod +x $REMOTE_DIR/refine-api && sudo systemctl restart refine-api"

echo "==> Checking health..."
sleep 2
ssh "$EC2_HOST" "curl -sf http://localhost:8080/health"
echo ""
echo "==> Deploy complete."
