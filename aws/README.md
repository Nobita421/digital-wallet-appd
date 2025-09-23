# AWS Deployment Guide

This directory contains AWS-specific deployment configurations and scripts for the Digital Wallet application.

## Prerequisites

### AWS Account Setup
1. Create an AWS account if you don't have one
2. Configure AWS CLI with your credentials:
   ```bash
   aws configure
   ```
3. Ensure your IAM user has the necessary permissions

### Required Tools
- AWS CLI (v2 or later)
- Docker
- Terraform (optional, for Terraform deployment)
- OpenSSL (for SSL certificates)

## Deployment Options

### Option 1: Automated Deployment Script

The easiest way to deploy is using the automated deployment script:

```bash
# Make the script executable
chmod +x aws/deploy.sh

# Run the deployment
./aws/deploy.sh
```

This script will:
- Create S3 bucket for deployments
- Build and upload Docker image
- Deploy CloudFormation stack
- Configure EC2 instances
- Deploy the application
- Run health checks

### Option 2: CloudFormation Deployment

1. **Deploy CloudFormation Stack**:
   ```bash
   aws cloudformation create-stack \
       --stack-name digital-wallet-app \
       --template-body file://aws/cloudformation.yml \
       --parameters \
           ParameterKey=S3Bucket,ParameterValue=digital-wallet-app-deployments \
           ParameterKey=AppName,ParameterValue=digital-wallet-app \
           ParameterKey=InstanceType,ParameterValue=t3.micro \
           ParameterKey=KeyName,ParameterValue=your-key-pair \
       --capabilities CAPABILITY_IAM \
       --region us-east-1
   ```

2. **Monitor Stack Creation**:
   ```bash
   aws cloudformation describe-stacks --stack-name digital-wallet-app
   ```

### Option 3: Terraform Deployment

1. **Initialize Terraform**:
   ```bash
   cd aws
   terraform init
   ```

2. **Plan Deployment**:
   ```bash
   terraform plan -var="key_name=your-key-pair"
   ```

3. **Apply Changes**:
   ```bash
   terraform apply -var="key_name=your-key-pair" -auto-approve
   ```

4. **Get Outputs**:
   ```bash
   terraform output
   ```

### Option 4: Manual EC2 Deployment

1. **Launch EC2 Instance**:
   - Use Amazon Linux 2 AMI
   - Choose appropriate instance type (t3.micro or larger)
   - Configure security groups (ports 22, 80, 443, 3000)
   - Add IAM role with S3 access

2. **Connect to Instance**:
   ```bash
   ssh -i your-key-pair.pem ec2-user@instance-public-ip
   ```

3. **Install Dependencies**:
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

4. **Install Docker Compose**:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

5. **Deploy Application**:
   ```bash
   sudo mkdir -p /opt/digital-wallet-app
   sudo chown -R ec2-user:ec2-user /opt/digital-wallet-app
   cd /opt/digital-wallet-app
   aws s3 cp s3://digital-wallet-app-deployments/ec2-deploy.sh ./
   chmod +x ec2-deploy.sh
   ./ec2-deploy.sh digital-wallet-app-deployments digital-wallet-app
   ```

## Configuration

### Environment Variables

Create a `.env` file in the application directory:

```env
NODE_ENV=production
DATABASE_URL=file:./data/dev.db
NEXTAUTH_URL=http://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```

### SSL Certificate Setup

For production deployment with HTTPS:

1. **Obtain SSL Certificate**:
   ```bash
   # Using Let's Encrypt
   sudo yum install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **Configure Nginx**:
   Update `nginx.conf` to use SSL certificates:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

### Database Configuration

The application uses SQLite by default. For production, consider:

1. **Amazon RDS**:
   - Create PostgreSQL or MySQL instance
   - Update `DATABASE_URL` in environment variables
   - Update Prisma schema

2. **Migration**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## Monitoring and Logging

### CloudWatch Monitoring

The CloudFormation template includes:
- CPU utilization alarms
- Auto-scaling policies
- Application health checks

### Custom Monitoring

The deployment includes:
- Health check script (`/opt/digital-wallet-app/health-check.sh`)
- Monitoring script (`/opt/digital-wallet-app/monitor.sh`)
- Log rotation setup

### Log Access

```bash
# View application logs
docker-compose -f /opt/digital-wallet-app/docker-compose.prod.yml logs -f app

# View monitoring logs
tail -f /opt/digital-wallet-app/logs/monitor.log
```

## Backup and Recovery

### Automated Backups

The application includes automated database backups:
- Daily backups at 2 AM
- 7-day retention period
- Backups stored in `/opt/digital-wallet-app/backups/`

### Manual Backup

```bash
# Create backup
sqlite3 /opt/digital-wallet-app/data/dev.db ".backup backup_$(date +%Y%m%d_%H%M%S).db"

# Restore from backup
sqlite3 /opt/digital-wallet-app/data/dev.db ".restore backup_filename.db"
```

### S3 Backup

```bash
# Upload backup to S3
aws s3 cp /opt/digital-wallet-app/backups/backup_filename.db s3://your-backup-bucket/

# Download backup from S3
aws s3 cp s3://your-backup-bucket/backup_filename.db ./
```

## Scaling

### Vertical Scaling

Update instance type in:
- CloudFormation parameters
- Terraform variables
- EC2 instance settings

### Horizontal Scaling

The Auto Scaling Group is configured to:
- Scale out when CPU > 80%
- Scale in when CPU < 20%
- Maintain 1-3 instances

### Load Balancing

The Application Load Balancer:
- Distributes traffic across instances
- Health checks every 30 seconds
- Automatic failover

## Security

### Security Groups

The security group allows:
- SSH (port 22) - restricted to your IP
- HTTP (port 80) - for web traffic
- HTTPS (port 443) - for secure web traffic
- Application (port 3000) - for direct access

### IAM Roles

The EC2 instance has permissions for:
- S3 read access for deployments
- CloudWatch logs for monitoring
- Limited access to other AWS services

### SSL/TLS

- Use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS headers
- Use strong cipher suites

## Cost Optimization

### Instance Types

- **Development**: t3.micro
- **Production**: t3.small or t3.medium
- **High Traffic**: t3.large or larger

### Auto Scaling

- Minimize costs with auto-scaling
- Use spot instances for non-critical workloads
- Schedule scaling for predictable traffic patterns

### Monitoring Costs

- Use AWS Cost Explorer
- Set up billing alerts
- Monitor reserved instance utilization

## Troubleshooting

### Common Issues

**Instance Not Starting**:
- Check CloudFormation stack status
- Review EC2 instance logs
- Verify IAM role permissions

**Application Not Accessible**:
- Check security group rules
- Verify load balancer health checks
- Review application logs

**Database Issues**:
- Check database connection strings
- Verify file permissions
- Review migration logs

### Debug Commands

```bash
# Check application status
sudo systemctl status digital-wallet-app

# View Docker containers
sudo docker ps -a

# Check Docker logs
sudo docker logs container-name

# Test application health
curl http://localhost:3000/api/health

# Check system resources
top
free -h
df -h
```

### Rollback Procedure

1. **Stop Application**:
   ```bash
   sudo systemctl stop digital-wallet-app
   ```

2. **Restore Backup**:
   ```bash
   sqlite3 /opt/digital-wallet-app/data/dev.db ".restore backup_filename.db"
   ```

3. **Restart Application**:
   ```bash
   sudo systemctl start digital-wallet-app
   ```

4. **Verify Health**:
   ```bash
   curl http://localhost:3000/api/health
   ```

## Support

For issues and questions:
1. Check AWS CloudWatch logs
2. Review application logs
3. Consult troubleshooting section
4. Contact AWS support for infrastructure issues
5. Open GitHub issue for application issues

## Best Practices

### Production Deployment
- Use multiple Availability Zones
- Implement proper monitoring
- Set up automated backups
- Use SSL certificates
- Configure proper logging
- Implement security best practices

### Maintenance
- Regularly update packages
- Monitor resource usage
- Review security policies
- Test backup and recovery
- Optimize performance
- Plan for capacity

### Disaster Recovery
- Regular backup testing
- Multi-region deployment
- Automated failover
- Documentation update
- Incident response plan