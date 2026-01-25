#!/bin/bash
set -e

# Log all output
exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting user data script at $(date)"

# Update system
dnf update -y

# Install Docker
dnf install -y docker
systemctl enable docker
systemctl start docker

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Install Docker Compose
DOCKER_COMPOSE_VERSION="v2.24.0"
curl -L "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Caddy
dnf install -y 'dnf-command(copr)'
dnf copr enable -y @caddy/caddy
dnf install -y caddy

# Create app directory
mkdir -p /opt/twilio-bridge
chown ec2-user:ec2-user /opt/twilio-bridge

# Create Caddyfile
cat > /etc/caddy/Caddyfile <<'CADDYFILE'
${domain_name} {
    reverse_proxy localhost:8080

    log {
        output file /var/log/caddy/access.log
        format json
    }
}
CADDYFILE

# Create log directory for Caddy
mkdir -p /var/log/caddy
chown caddy:caddy /var/log/caddy

# Enable and start Caddy
systemctl enable caddy
systemctl start caddy

# Create environment file for the app
cat > /opt/twilio-bridge/.env <<'ENVFILE'
AWS_REGION=${aws_region}
S3_BUCKET=${s3_bucket}
S3_TRANSCRIPT_PREFIX=transcripts/
ENVFILE

# Create a placeholder docker-compose.yml
cat > /opt/twilio-bridge/docker-compose.yml <<'COMPOSEFILE'
version: '3.8'

services:
  app:
    image: your-twilio-bridge-image:latest
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - .env
    environment:
      - PORT=8080
    # volumes:
    #   - ./data:/app/data
COMPOSEFILE

chown ec2-user:ec2-user /opt/twilio-bridge/.env
chown ec2-user:ec2-user /opt/twilio-bridge/docker-compose.yml

echo "User data script completed at $(date)"
echo "Next steps:"
echo "1. SSH to this instance"
echo "2. cd /opt/twilio-bridge"
echo "3. Update docker-compose.yml with your actual image"
echo "4. Run: docker-compose up -d"
