# GitHub Actions CI/CD

This directory contains the GitHub Actions workflows for the Digital Wallet application.

## Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Jobs:**
- **Test**: Runs linting, builds the application, and runs tests
- **Build and Push**: Builds Docker image and pushes to GitHub Container Registry
- **Deploy Staging**: Deploys to staging environment
- **Deploy Production**: Deploys to production environment
- **Security Scan**: Runs vulnerability scanning with Trivy

### 2. Database Management (`.github/workflows/database.yml`)

**Triggers:**
- Manual dispatch with inputs for action and environment

**Actions:**
- **Migrate**: Run database migrations
- **Seed**: Seed database with initial data
- **Reset**: Reset database and reseed

### 3. Application Monitoring (`.github/workflows/monitoring.yml`)

**Triggers:**
- Scheduled every 5 minutes
- Manual dispatch

**Jobs:**
- **Health Check**: Monitors application health and API endpoints
- **SSL Check**: Monitors SSL certificate expiration
- **Backup Check**: Verifies backup integrity and schedule

### 4. Dependency Updates (`.github/workflows/dependency-updates.yml`)

**Triggers:**
- Scheduled every Monday at 6 AM UTC
- Manual dispatch

**Jobs:**
- **Update Dependencies**: Updates npm packages and creates PRs
- **Security Audit**: Runs security audits and fixes vulnerabilities

## Required Secrets

### Environment Secrets
Configure these secrets in your GitHub repository settings:

#### Staging Environment
- `STAGING_HOST`: Staging server hostname
- `STAGING_USER`: SSH username for staging server
- `STAGING_SSH_KEY`: SSH private key for staging server
- `STAGING_URL`: Staging application URL
- `STAGING_DATABASE_URL`: Database connection string for staging

#### Production Environment
- `PRODUCTION_HOST`: Production server hostname
- `PRODUCTION_USER`: SSH username for production server
- `PRODUCTION_SSH_KEY`: SSH private key for production server
- `PRODUCTION_URL`: Production application URL
- `PRODUCTION_DATABASE_URL`: Database connection string for production
- `PRODUCTION_DOMAIN`: Production domain name

#### Common Secrets
- `GITHUB_TOKEN`: GitHub token for authentication (automatically provided)
- `SLACK_WEBHOOK`: Slack webhook for notifications (optional)

### SSL Certificate Secrets
- `STAGING_DOMAIN`: Staging domain name
- `PRODUCTION_DOMAIN`: Production domain name

## Setup Instructions

### 1. Configure GitHub Secrets

1. Go to your repository on GitHub
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Add the required secrets listed above

### 2. Configure Environments

1. Go to "Settings" → "Environments"
2. Create environments:
   - `staging`
   - `production`
3. Configure protection rules as needed

### 3. Server Preparation

Ensure your servers have:
- Docker and Docker Compose installed
- SSH access configured
- Proper file permissions
- Required environment variables set

### 4. SSL Certificates

For production deployment:
- Obtain SSL certificates for your domains
- Configure nginx with SSL
- Set up auto-renewal with Let's Encrypt

## Usage

### Manual Database Operations

1. Go to the "Actions" tab in your repository
2. Select "Database Management" workflow
3. Click "Run workflow"
4. Choose the action and environment
5. Click "Run workflow"

### Manual Dependency Updates

1. Go to the "Actions" tab
2. Select "Dependency Updates" workflow
3. Click "Run workflow"
4. Choose the update type
5. Click "Run workflow"

### Monitoring

The monitoring workflow runs automatically every 5 minutes. You can also run it manually:
1. Go to the "Actions" tab
2. Select "Application Monitoring" workflow
3. Click "Run workflow"

## Customization

### Adding New Environments

1. Add environment secrets in GitHub settings
2. Update workflow files to include the new environment
3. Update server configuration

### Modifying Build Process

1. Edit the Dockerfile if needed
2. Update the CI/CD workflow
3. Test changes in a feature branch

### Adding New Monitoring Checks

1. Add new jobs to the monitoring workflow
2. Configure appropriate notifications
3. Test the monitoring checks

## Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are properly installed
- Review build logs for specific errors

**Deployment Failures**
- Verify SSH access to servers
- Check Docker daemon status on servers
- Review environment variables and secrets

**Database Issues**
- Verify database connection strings
- Check database permissions
- Review migration logs

### Debug Mode

To enable debug logging, add the following to your workflow steps:

```yaml
- name: Enable debug logging
  run: |
    echo "::debug::Debug mode enabled"
    # Add debug commands here
```

### Rollback Procedure

If a deployment fails:
1. Check the workflow logs for errors
2. Manually revert to the previous working version
3. Run database rollback if necessary
4. Fix the issues and redeploy

## Security Considerations

- Never commit sensitive data to version control
- Use GitHub secrets for all sensitive information
- Regularly rotate SSH keys and access tokens
- Monitor workflow runs for suspicious activity
- Keep dependencies up to date

## Support

For issues with the CI/CD pipeline:
1. Check the workflow logs
2. Review this documentation
3. Open an issue in the repository
4. Contact the development team