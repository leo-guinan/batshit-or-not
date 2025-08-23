# 🚀 Deployment Guide for Batshit or Not

This guide covers deploying Batshit or Not to AWS using FlightControl.

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **FlightControl Account**: Sign up at [flightcontrol.dev](https://flightcontrol.dev)
3. **AWS Account**: FlightControl will deploy to your AWS account

## 🔧 Pre-Deployment Setup

### 1. Environment Variables

Before deploying, you'll need to set up these secrets in AWS Systems Manager Parameter Store:

#### Production Secrets
```bash
# Create session secret (use AWS CLI or Console)
aws ssm put-parameter \
  --name "batshit-session-secret" \
  --value "your-super-secret-random-string-here" \
  --type "SecureString" \
  --region "us-west-2"
```

#### Staging Secrets
```bash
aws ssm put-parameter \
  --name "batshit-session-secret-staging" \
  --value "your-staging-secret-random-string-here" \
  --type "SecureString" \
  --region "us-west-2"
```

**Note**: Generate secure random strings using:
```bash
openssl rand -hex 32
```

### 2. Database Setup

FlightControl will automatically provision RDS PostgreSQL databases as defined in `flightcontrol.json`:
- **Production**: db.t4g.micro with 20GB storage, 7-day backups
- **Staging**: db.t4g.micro with 10GB storage, 1-day backups

## 🎯 Deployment Steps

### Step 1: Connect GitHub to FlightControl

1. Log in to [FlightControl Dashboard](https://app.flightcontrol.dev)
2. Click "New Project"
3. Connect your GitHub account
4. Select the `BatshitOrNot` repository

### Step 2: Review Configuration

FlightControl will automatically detect the `flightcontrol.json` file and show:

**Production Environment:**
- Fargate service with auto-scaling (1-3 instances)
- RDS PostgreSQL database
- Application Load Balancer
- CloudWatch logging

**Staging Environment:**
- Single Fargate instance
- RDS PostgreSQL database
- Application Load Balancer
- CloudWatch logging

### Step 3: Deploy

1. Click "Create Project"
2. FlightControl will:
   - Create AWS resources (VPC, ECS, RDS, ALB, etc.)
   - Build your application using Nixpacks
   - Run database migrations
   - Deploy the application
   - Set up health checks

### Step 4: Monitor Deployment

Watch the deployment progress in the FlightControl dashboard:
- 🟡 Building: Docker image is being built
- 🔵 Deploying: Pushing to ECS
- 🟢 Healthy: Application is running

## 🌍 Environments

### Production
- **Branch**: `main`
- **URL**: Will be provided by FlightControl (e.g., `https://batshit-app-xxx.flightcontrol.app`)
- **Scaling**: 1-3 instances based on CPU/Memory usage
- **Database**: Production RDS with deletion protection

### Staging
- **Branch**: `develop`
- **URL**: Will be provided by FlightControl
- **Scaling**: Single instance
- **Database**: Staging RDS without deletion protection

## 📊 Resource Configuration

### Service Configuration (Production)
```json
{
  "cpu": 0.5,          // 0.5 vCPU
  "memory": 1,         // 1 GB RAM
  "minInstances": 1,   // Minimum running instances
  "maxInstances": 3,   // Maximum for auto-scaling
  "autoscaling": {
    "targetCPU": 70,     // Scale at 70% CPU
    "targetMemory": 80   // Scale at 80% memory
  }
}
```

### Database Configuration (Production)
```json
{
  "instanceClass": "db.t4g.micro",    // ARM-based, cost-effective
  "storage": 20,                      // 20 GB storage
  "backupRetentionPeriod": 7,        // 7 days of backups
  "deletionProtection": true         // Prevent accidental deletion
}
```

## 🔄 Continuous Deployment

After initial setup:
1. **Production**: Push to `main` branch → Auto-deploy
2. **Staging**: Push to `develop` branch → Auto-deploy

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-app-url.flightcontrol.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. Database Migration Verification

Check CloudWatch logs for:
```
Running database migrations...
Database migrations complete!
```

### 3. Application Testing

1. Navigate to your application URL
2. Test user registration
3. Test user login
4. Submit a test idea
5. Rate ideas
6. Check profile page

## 🔍 Monitoring

### CloudWatch Logs

Access logs through:
1. FlightControl Dashboard → Your Service → Logs
2. AWS Console → CloudWatch → Log Groups → `/flightcontrol/batshit-app`

### Metrics to Monitor

- **CPU Utilization**: Should stay below 70%
- **Memory Utilization**: Should stay below 80%
- **Request Count**: Monitor traffic patterns
- **Error Rate**: Should be < 1%
- **Response Time**: Aim for < 500ms p95

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Check `DATABASE_URL` is correctly set
- Verify security groups allow connection
- Check RDS instance is running

#### 2. Session Errors
- Verify `SESSION_SECRET` is set in Parameter Store
- Check session table exists in database

#### 3. Build Failures
- Check Node version compatibility
- Verify all dependencies are in `package.json`
- Review build logs in FlightControl

#### 4. Health Check Failures
- Verify `/health` endpoint is accessible
- Check application startup logs
- Ensure port 5000 is correctly configured

### Rollback Procedure

1. Go to FlightControl Dashboard
2. Select your environment
3. Click "Deployments" tab
4. Find the last working deployment
5. Click "Rollback to this version"

## 💰 Cost Estimation

### Monthly Costs (Approximate)

**Production:**
- Fargate: ~$20-60 (depending on scaling)
- RDS: ~$15 (db.t4g.micro)
- ALB: ~$20
- Data transfer: ~$5-10
- **Total**: ~$60-105/month

**Staging:**
- Fargate: ~$10
- RDS: ~$15
- ALB: ~$20
- **Total**: ~$45/month

## 🔐 Security Best Practices

1. **Never commit secrets** to the repository
2. **Use Parameter Store** for sensitive configuration
3. **Enable deletion protection** on production database
4. **Regular backups** are configured (7 days retention)
5. **HTTPS only** - FlightControl provides SSL certificates
6. **Security groups** are automatically configured

## 📝 Maintenance

### Database Backups
- Automated daily backups
- 7-day retention for production
- Can restore from FlightControl dashboard

### Updates
1. Test in staging first
2. Monitor staging for 24 hours
3. Deploy to production
4. Monitor metrics post-deployment

### Scaling
Adjust in `flightcontrol.json`:
- Increase `cpu` and `memory` for vertical scaling
- Increase `maxInstances` for horizontal scaling
- Upgrade `instanceClass` for database

## 🆘 Support

- **FlightControl Support**: support@flightcontrol.dev
- **Documentation**: [docs.flightcontrol.dev](https://docs.flightcontrol.dev)
- **AWS Support**: Through your AWS support plan

---

Remember to test thoroughly in staging before promoting to production! 🦇