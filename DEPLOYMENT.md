# Digital Wallet App - Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Set up the database:
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Docker Deployment

### Development with Docker
```bash
# Build and run the application
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop the application
docker-compose down
```

### Production Deployment
```bash
# Production build with nginx
docker-compose -f docker-compose.prod.yml up --build

# Production with Redis caching
docker-compose -f docker-compose.prod.yml --profile redis up --build
```

### Environment Variables
Create a `.env` file with the following variables:
```env
NODE_ENV=production
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Manual Deployment

### Build the Application
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Build the application
npm run build

# Start the production server
npm start
```

### Database Setup
```bash
# Push database schema
npm run db:push

# Generate Prisma client
npm run db:generate

# Run database migrations (if using PostgreSQL/MySQL)
npm run db:migrate
```

## AWS Deployment Guide

### Prerequisites
- AWS account
- AWS CLI installed and configured
- Docker installed

### Option 1: AWS EC2 with Docker

1. **Launch an EC2 Instance**
   - Choose Amazon Linux 2 or Ubuntu
   - Configure security groups (ports 80, 443, 22)
   - Attach IAM role with necessary permissions

2. **Install Docker on EC2**
   ```bash
   # For Amazon Linux 2
   sudo amazon-linux-extras install docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user

   # For Ubuntu
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -a -G docker $USER
   ```

3. **Deploy the Application**
   ```bash
   # Clone the repository
   git clone <your-repo-url>
   cd digital-wallet-app

   # Set up environment variables
   cp .env.example .env
   nano .env

   # Build and run with Docker Compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Option 2: AWS ECS (Elastic Container Service)

1. **Build and Push Docker Image to ECR**
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name digital-wallet-app

   # Get login token
   aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<your-region>.amazonaws.com

   # Build and tag image
   docker build -t digital-wallet-app .
   docker tag digital-wallet-app:latest <aws-account-id>.dkr.ecr.<your-region>.amazonaws.com/digital-wallet-app:latest

   # Push image
   docker push <aws-account-id>.dkr.ecr.<your-region>.amazonaws.com/digital-wallet-app:latest
   ```

2. **Create ECS Task Definition**
   ```json
   {
     "family": "digital-wallet-app",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "digital-wallet-app",
         "image": "<aws-account-id>.dkr.ecr.<your-region>.amazonaws.com/digital-wallet-app:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/digital-wallet-app",
             "awslogs-region": "<your-region>",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

3. **Create ECS Service**
   - Create ECS Cluster
   - Create Task Definition with above JSON
   - Create Service using the task definition
   - Configure load balancer and target groups

### Option 3: AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB Application**
   ```bash
   eb init
   ```

3. **Create Environment**
   ```bash
   eb create production
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

### Option 4: AWS Amplify

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```

3. **Add Hosting**
   ```bash
   amplify add hosting
   ```

4. **Publish**
   ```bash
   amplify publish
   ```

## SSL Certificate Setup

### Using Let's Encrypt with Nginx
1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain SSL certificate:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. Auto-renewal:
   ```bash
   sudo crontab -e
   ```
   Add:
   ```
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Monitoring and Logging

### Application Monitoring
- Set up AWS CloudWatch for application metrics
- Configure logging to CloudWatch Logs
- Set up alarms for critical metrics

### Database Monitoring
- Monitor database performance
- Set up automated backups
- Configure alerts for storage usage

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure appropriate CORS policies
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Authentication**: Use secure authentication methods
6. **Data Encryption**: Encrypt sensitive data at rest and in transit

## Backup and Recovery

### Database Backups
```bash
# SQLite backup
sqlite3 dev.db ".backup backup.db"

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
sqlite3 dev.db ".backup backups/backup_$DATE.db"
```

### Recovery
```bash
# Restore from backup
sqlite3 dev.db ".restore backup.db"
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancers
- Implement container orchestration
- Use auto-scaling groups

### Vertical Scaling
- Monitor resource usage
- Upgrade instance types as needed
- Optimize database performance

## Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports are already in use
2. **Database connection**: Verify database URL and credentials
3. **Build failures**: Check Node.js version and dependencies
4. **SSL issues**: Verify certificate configuration

### Log Analysis
```bash
# View application logs
docker-compose logs -f app

# View nginx logs
docker-compose logs -f nginx

# View database logs
docker-compose logs -f db
```

## Support

For issues and questions:
- Check the GitHub repository
- Review the troubleshooting section
- Contact the development team