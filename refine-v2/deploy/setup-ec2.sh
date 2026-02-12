#!/usr/bin/env bash
# Run this ON the EC2 instance as root/sudo
# Usage: sudo bash setup-ec2.sh
set -euo pipefail

echo "==> Updating packages..."
apt-get update && apt-get upgrade -y

echo "==> Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

echo "==> Starting PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql

echo "==> Creating database and user..."
sudo -u postgres psql <<SQL
CREATE USER refine WITH PASSWORD 'CHANGE_ME';
CREATE DATABASE refine OWNER refine;
GRANT ALL PRIVILEGES ON DATABASE refine TO refine;
SQL

echo "==> Installing Caddy..."
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

echo "==> Creating refine system user..."
useradd --system --no-create-home refine || true

echo "==> Setting up /opt/refine..."
mkdir -p /opt/refine
chown refine:refine /opt/refine

echo "==> Done! Next steps:"
echo "  1. Copy .env to /opt/refine/.env and fill in real values"
echo "  2. Copy refine-api binary to /opt/refine/"
echo "  3. Copy Caddyfile to /etc/caddy/Caddyfile"
echo "  4. Copy refine-api.service to /etc/systemd/system/"
echo "  5. Run: sudo systemctl daemon-reload"
echo "  6. Run: sudo systemctl enable --now refine-api"
echo "  7. Run: sudo systemctl restart caddy"
