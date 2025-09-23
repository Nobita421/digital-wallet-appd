#!/bin/bash

# AWS Deployment Script for Digital Wallet App
# This script automates the deployment process on AWS EC2

set -e

# Configuration
AWS_REGION="us-east-1"
EC2_INSTANCE_ID=""
S3_BUCKET="digital-wallet-app-deployments"
STACK_NAME="digital-wallet-app"

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured. Please run 'aws configure'."
        exit 1
    fi
    
    log_info "Prerequisites check passed."
}

# Create S3 bucket for deployments
create_s3_bucket() {
    log_info "Creating S3 bucket for deployments..."
    
    if ! aws s3 ls "s3://$S3_BUCKET" 2>/dev/null; then
        aws s3 mb "s3://$S3_BUCKET" --region "$AWS_REGION"
        log_info "S3 bucket created: $S3_BUCKET"
    else
        log_warn "S3 bucket already exists: $S3_BUCKET"
    fi
}

# Build and upload application
build_and_upload() {
    log_info "Building application..."
    
    # Build Docker image
    docker build -t digital-wallet-app .
    
    # Save Docker image
    docker save -o digital-wallet-app.tar digital-wallet-app
    
    # Upload to S3
    aws s3 cp digital-wallet-app.tar "s3://$S3_BUCKET/"
    
    # Upload deployment scripts
    aws s3 cp aws/ "s3://$S3_BUCKET/" --recursive
    
    # Clean up local files
    rm -f digital-wallet-app.tar
    
    log_info "Application built and uploaded to S3."
}

# Create or update CloudFormation stack
deploy_cloudformation() {
    log_info "Deploying CloudFormation stack..."
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" &> /dev/null; then
        log_info "Stack exists, updating..."
        aws cloudformation update-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://aws/cloudformation.yml \
            --parameters \
                ParameterKey=S3Bucket,ParameterValue="$S3_BUCKET" \
                ParameterKey=AppName,ParameterValue="$STACK_NAME" \
            --capabilities CAPABILITY_IAM \
            --region "$AWS_REGION"
        
        # Wait for update to complete
        aws cloudformation wait stack-update-complete \
            --stack-name "$STACK_NAME" \
            --region "$AWS_REGION"
    else
        log_info "Creating new stack..."
        aws cloudformation create-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://aws/cloudformation.yml \
            --parameters \
                ParameterKey=S3Bucket,ParameterValue="$S3_BUCKET" \
                ParameterKey=AppName,ParameterValue="$STACK_NAME" \
            --capabilities CAPABILITY_IAM \
            --region "$AWS_REGION"
        
        # Wait for creation to complete
        aws cloudformation wait stack-create-complete \
            --stack-name "$STACK_NAME" \
            --region "$AWS_REGION"
    fi
    
    log_info "CloudFormation stack deployed successfully."
}

# Get EC2 instance public IP
get_instance_ip() {
    EC2_INSTANCE_ID=$(aws cloudformation describe-stack-resources \
        --stack-name "$STACK_NAME" \
        --region "$AWS_REGION" \
        --query "StackResources[?ResourceType=='AWS::EC2::Instance'].PhysicalResourceId" \
        --output text)
    
    if [ -z "$EC2_INSTANCE_ID" ]; then
        log_error "Could not get EC2 instance ID from CloudFormation stack."
        exit 1
    fi
    
    INSTANCE_IP=$(aws ec2 describe-instances \
        --instance-ids "$EC2_INSTANCE_ID" \
        --region "$AWS_REGION" \
        --query "Reservations[0].Instances[0].PublicIpAddress" \
        --output text)
    
    if [ -z "$INSTANCE_IP" ]; then
        log_error "Could not get EC2 instance public IP."
        exit 1
    fi
    
    log_info "EC2 Instance IP: $INSTANCE_IP"
}

# Deploy application to EC2
deploy_to_ec2() {
    log_info "Deploying application to EC2 instance..."
    
    # Wait for SSH to be available
    log_info "Waiting for SSH to be available..."
    while ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 ec2-user@"$INSTANCE_IP" "echo SSH is ready" 2>/dev/null; do
        sleep 5
    done
    
    # Copy deployment script to EC2
    scp -o StrictHostKeyChecking=no aws/ec2-deploy.sh ec2-user@"$INSTANCE_IP":/tmp/
    
    # Execute deployment script on EC2
    ssh -o StrictHostKeyChecking=no ec2-user@"$INSTANCE_IP" \
        "chmod +x /tmp/ec2-deploy.sh && sudo /tmp/ec2-deploy.sh $S3_BUCKET $STACK_NAME"
    
    log_info "Application deployed to EC2 instance."
}

# Run health check
health_check() {
    log_info "Running health check..."
    
    # Wait for application to start
    sleep 30
    
    # Check if application is responding
    if curl -s -f "http://$INSTANCE_IP:3000/api/health" > /dev/null; then
        log_info "Health check passed."
    else
        log_error "Health check failed."
        exit 1
    fi
}

# Main deployment process
main() {
    log_info "Starting AWS deployment for Digital Wallet App..."
    
    check_prerequisites
    create_s3_bucket
    build_and_upload
    deploy_cloudformation
    get_instance_ip
    deploy_to_ec2
    health_check
    
    log_info "Deployment completed successfully!"
    log_info "Application is available at: http://$INSTANCE_IP:3000"
}

# Run main function
main "$@"