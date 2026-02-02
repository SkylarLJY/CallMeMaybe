#!/bin/bash
set -e

exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting user data script at $(date)"

# Update system and install Docker
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# Install Docker Compose plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Create app directory
mkdir -p /opt/twilio-bridge
cd /opt/twilio-bridge

# Write config files
cat > Caddyfile <<'EOF'
${caddyfile}
EOF

cat > docker-compose.yml <<'EOF'
${docker_compose}
EOF

cat > .env <<'EOF'
${env_file}
EOF

chown -R ec2-user:ec2-user /opt/twilio-bridge

# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
systemctl enable tailscaled
systemctl start tailscaled

# Auto-authenticate if auth key provided
if [ -n "${tailscale_auth_key}" ]; then
  tailscale up --authkey="${tailscale_auth_key}"
  echo "Tailscale authenticated with auth key"
else
  echo "Tailscale installed - run 'sudo tailscale up' to authenticate"
fi

# Login to ECR and start services
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_url}
docker compose pull
docker compose up -d

echo "User data script completed at $(date)"
