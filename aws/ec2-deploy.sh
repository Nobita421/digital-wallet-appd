#!/bin/bash

# EC2 Deployment Script
# This script runs on the EC2 instance to deploy the application

set -e

# Configuration
S3_BUCKET="$1"
APP_NAME="$2"
APP_DIR="/opt/digital-wallet-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root"
    exit 1
fi

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Update system
    yum update -y
    
    # Install Docker
    yum install -y docker
    systemctl start docker
    systemctl enable docker
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Install AWS CLI
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf awscliv2.zip aws
    
    log_info "Dependencies installed successfully."
}

# Create application directory
setup_app_directory() {
    log_info "Setting up application directory..."
    
    mkdir -p "$APP_DIR"
    mkdir -p "$APP_DIR/data"
    mkdir -p "$APP_DIR/backups"
    mkdir -p "$APP_DIR/ssl"
    
    # Set permissions
    chown -R ec2-user:ec2-user "$APP_DIR"
    chmod -R 755 "$APP_DIR"
    
    log_info "Application directory created."
}

# Download application from S3
download_application() {
    log_info "Downloading application from S3..."
    
    cd "$APP_DIR"
    
    # Download Docker image
    aws s3 cp "s3://$S3_BUCKET/digital-wallet-app.tar" ./
    
    # Download docker-compose files
    aws s3 cp "s3://$S3_BUCKET/docker-compose.yml" ./
    aws s3 cp "s3://$S3_BUCKET/docker-compose.prod.yml" ./
    aws s3 cp "s3://$S3_BUCKET/nginx.conf" ./
    
    # Load Docker image
    docker load -i digital-wallet-app.tar
    rm -f digital-wallet-app.tar
    
    log_info "Application downloaded successfully."
}

# Create environment file
create_env_file() {
    log_info "Creating environment file..."
    
    cat > "$APP_DIR/.env" << EOF
NODE_ENV=production
DATABASE_URL=file:./data/dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
EOF
    
    # Set permissions
    chown ec2-user:ec2-user "$APP_DIR/.env"
    chmod 600 "$APP_DIR/.env"
    
    log_info "Environment file created."
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    # Install Certbot
    yum install -y certbot python3-certbot-nginx
    
    # Create a simple nginx config for SSL verification
    cat > /tmp/nginx-ssl.conf << EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name _;
        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF
    
    # Start temporary nginx for SSL verification
    nginx -c /tmp/nginx-ssl.conf &
    NGINX_PID=$!
    
    # Note: SSL certificate setup requires domain name configuration
    # Uncomment and configure the following lines when you have a domain:
    # certbot --nginx -d your-domain.com
    # cp /etc/letsencrypt/live/your-domain.com/* "$APP_DIR/ssl/"
    
    # Stop temporary nginx
    kill $NGINX_PID 2>/dev/null || true
    rm -f /tmp/nginx-ssl.conf
    
    log_info "SSL setup completed."
}

# Create systemd service
create_systemd_service() {
    log_info "Creating systemd service..."
    
    cat > /etc/systemd/system/digital-wallet-app.service << EOF
[Unit]
Description=Digital Wallet App
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=ec2-user
Group=ec2-user

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd
    systemctl daemon-reload
    
    # Enable service
    systemctl enable digital-wallet-app.service
    
    log_info "Systemd service created."
}

# Setup log rotation
setup_log_rotation() {
    log_info "Setting up log rotation..."
    
    cat > /etc/logrotate.d/digital-wallet-app << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
    postrotate
        docker-compose -f $APP_DIR/docker-compose.prod.yml exec app nginx -s reload
    endscript
}
EOF
    
    log_info "Log rotation setup completed."
}

# Create backup script
create_backup_script() {
    log_info "Creating backup script..."
    
    cat > "$APP_DIR/backup.sh" << EOF
#!/bin/bash

# Backup script for Digital Wallet App
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)

# Create backup
sqlite3 "$APP_DIR/data/dev.db" ".backup \$BACKUP_DIR/backup_\$TIMESTAMP.db"

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "backup_*.db" -mtime +7 -delete

echo "Backup created: backup_\$TIMESTAMP.db"
EOF
    
    # Make script executable
    chmod +x "$APP_DIR/backup.sh"
    chown ec2-user:ec2-user "$APP_DIR/backup.sh"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -
    
    log_info "Backup script created."
}

# Start application
start_application() {
    log_info "Starting application..."
    
    cd "$APP_DIR"
    
    # Start the application
    systemctl start digital-wallet-app
    
    # Wait for application to start
    sleep 30
    
    # Check if application is running
    if systemctl is-active --quiet digital-wallet-app; then
        log_info "Application started successfully."
    else
        log_error "Failed to start application."
        exit 1
    fi
}

# Main deployment process
main() {
    log_info "Starting EC2 deployment for Digital Wallet App..."
    
    install_dependencies
    setup_app_directory
    download_application
    create_env_file
    setup_ssl
    create_systemd_service
    setup_log_rotation
    create_backup_script
    start_application
    
    log_info "EC2 deployment completed successfully!"
}

# Run main function
main "$@"