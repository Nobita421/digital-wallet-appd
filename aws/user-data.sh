#!/bin/bash

# User data script for EC2 instances
set -e

# Variables
S3_BUCKET="${s3_bucket}"
APP_NAME="${app_name}"
APP_DIR="/opt/digital-wallet-app"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting user data script..."

# Update system
log "Updating system..."
yum update -y

# Install Docker
log "Installing Docker..."
yum install -y docker
systemctl start docker
systemctl enable docker

# Install Docker Compose
log "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
log "Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws

# Create application directory
log "Creating application directory..."
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/data"
mkdir -p "$APP_DIR/backups"
mkdir -p "$APP_DIR/ssl"
chown -R ec2-user:ec2-user "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Download deployment script from S3
log "Downloading deployment script..."
cd "$APP_DIR"
aws s3 cp "s3://$S3_BUCKET/ec2-deploy.sh" ./
chmod +x ec2-deploy.sh

# Run deployment script
log "Running deployment script..."
./ec2-deploy.sh "$S3_BUCKET" "$APP_NAME"

# Create health check script
log "Creating health check script..."
cat > "$APP_DIR/health-check.sh" << 'EOF'
#!/bin/bash

# Health check script for Digital Wallet App
APP_DIR="/opt/digital-wallet-app"

# Check if Docker is running
if ! systemctl is-active --quiet docker; then
    echo "Docker is not running"
    exit 1
fi

# Check if application container is running
if ! docker-compose -f "$APP_DIR/docker-compose.prod.yml" ps app | grep -q "Up"; then
    echo "Application container is not running"
    exit 1
fi

# Check application health
if ! curl -s -f "http://localhost:3000/api/health" > /dev/null; then
    echo "Application health check failed"
    exit 1
fi

echo "Application is healthy"
exit 0
EOF

chmod +x "$APP_DIR/health-check.sh"
chown ec2-user:ec2-user "$APP_DIR/health-check.sh"

# Create monitoring script
log "Creating monitoring script..."
cat > "$APP_DIR/monitor.sh" << 'EOF'
#!/bin/bash

# Monitoring script for Digital Wallet App
APP_DIR="/opt/digital-wallet-app"
LOG_FILE="$APP_DIR/logs/monitor.log"

# Create logs directory
mkdir -p "$APP_DIR/logs"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check disk space
DISK_USAGE=$(df "$APP_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$MEMORY_USAGE" -gt 80 ]; then
    log "WARNING: Memory usage is ${MEMORY_USAGE}%"
fi

# Check CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    log "WARNING: CPU usage is ${CPU_USAGE}%"
fi

# Check application logs for errors
if docker-compose -f "$APP_DIR/docker-compose.prod.yml" logs app | grep -q "ERROR\|FATAL"; then
    log "WARNING: Errors found in application logs"
fi

log "Monitoring check completed"
EOF

chmod +x "$APP_DIR/monitor.sh"
chown ec2-user:ec2-user "$APP_DIR/monitor.sh"

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/monitor.sh") | crontab -

# Create cleanup script
log "Creating cleanup script..."
cat > "$APP_DIR/cleanup.sh" << 'EOF'
#!/bin/bash

# Cleanup script for Digital Wallet App
APP_DIR="/opt/digital-wallet-app"

# Clean up old logs
find "$APP_DIR/logs" -name "*.log" -mtime +7 -delete

# Clean up Docker logs
docker system prune -f

# Clean up old backups (keep last 30 days)
find "$APP_DIR/backups" -name "backup_*.db" -mtime +30 -delete

echo "Cleanup completed"
EOF

chmod +x "$APP_DIR/cleanup.sh"
chown ec2-user:ec2-user "$APP_DIR/cleanup.sh"

# Add cleanup to crontab (weekly)
(crontab -l 2>/dev/null; echo "0 2 * * 0 $APP_DIR/cleanup.sh") | crontab -

log "User data script completed successfully!"