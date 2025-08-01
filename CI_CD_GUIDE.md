# 🚀 CI/CD Guide for NTFG HRMS

## 📋 Overview

This guide covers the complete Continuous Integration and Continuous Deployment (CI/CD) setup for the NTFG HRMS project using GitHub Actions.

## 🏗️ CI/CD Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │───▶│   GitHub Repo   │───▶│   CI Pipeline   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Production    │◀───│     Staging     │◀───│   CD Pipeline   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Workflows Overview

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)
**Triggers**: Push to `main`/`develop`, Pull Requests
**Purpose**: Automated testing, linting, security scanning

**Jobs**:
- **Backend Tests**: Unit tests, integration tests, linting
- **Frontend Tests**: Component tests, build verification, linting
- **Security Scan**: Vulnerability scanning with Trivy
- **Docker Build**: Container image building and testing
- **Code Quality**: SonarCloud analysis

### 2. **CD Pipeline** (`.github/workflows/cd.yml`)
**Triggers**: Successful CI on `main`, Version tags
**Purpose**: Automated deployment to staging and production

**Jobs**:
- **Build & Push**: Docker images to GitHub Container Registry
- **Deploy Staging**: Automatic deployment to staging environment
- **Deploy Production**: Manual deployment to production (on tags)
- **Rollback**: Automatic rollback on deployment failure
- **Cleanup**: Remove old container images

### 3. **Release Workflow** (`.github/workflows/release.yml`)
**Triggers**: Version tags (`v*`)
**Purpose**: Create GitHub releases with artifacts

**Features**:
- Automated changelog generation
- Release artifacts (tar.gz, zip)
- Deployment guides
- Version management

### 4. **Dependency Updates** (`.github/workflows/dependency-update.yml`)
**Triggers**: Weekly schedule, Manual trigger
**Purpose**: Automated dependency management

**Features**:
- NPM package updates
- Security vulnerability fixes
- Automated pull requests
- Security audit reports

### 5. **Monitoring & Alerts** (`.github/workflows/monitoring.yml`)
**Triggers**: Every 6 hours, Manual trigger
**Purpose**: Production monitoring and alerting

**Features**:
- Health checks
- Performance monitoring (Lighthouse)
- Security monitoring
- Automated issue creation on failures

## 🛠️ Setup Instructions

### Step 1: Repository Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

```bash
# Required Secrets
SONAR_TOKEN=your_sonarcloud_token
PRODUCTION_URL=https://your-production-domain.com

# Optional Secrets (for advanced features)
SLACK_WEBHOOK=your_slack_webhook_url
DISCORD_WEBHOOK=your_discord_webhook_url
```

### Step 2: SonarCloud Setup

1. Go to [SonarCloud.io](https://sonarcloud.io)
2. Import your GitHub repository
3. Get your project token
4. Add `SONAR_TOKEN` to GitHub secrets

### Step 3: Container Registry

GitHub Container Registry is automatically configured. Images will be pushed to:
- `ghcr.io/saksham1508/ntfg-hrms-backend`
- `ghcr.io/saksham1508/ntfg-hrms-frontend`

### Step 4: Environment Configuration

Create environment-specific configuration files:

```bash
# server/.env.staging
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb://staging-db:27017/ntfg_hrms
JWT_SECRET=staging_jwt_secret
# ... other staging configs

# server/.env.production
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://prod-db:27017/ntfg_hrms
JWT_SECRET=production_jwt_secret
# ... other production configs
```

## 🚀 Deployment Process

### Automatic Deployment (Staging)

1. **Push to main branch**
2. **CI pipeline runs** (tests, builds, scans)
3. **CD pipeline triggers** (on CI success)
4. **Docker images built and pushed**
5. **Staging deployment** (automatic)
6. **Health checks performed**

### Production Deployment

1. **Create and push a version tag**:
   ```bash
   git tag -a v1.1.0 -m "Release version 1.1.0"
   git push origin v1.1.0
   ```

2. **Release workflow creates GitHub release**
3. **CD pipeline deploys to production**
4. **Manual approval required** (GitHub Environments)
5. **Health checks and monitoring**

## 📊 Monitoring & Alerts

### Health Monitoring
- **Backend API**: `/api/health` endpoint checks
- **Frontend**: Homepage availability checks
- **Database**: Connection and query performance
- **Services**: Docker container status

### Performance Monitoring
- **Lighthouse audits**: Performance, accessibility, SEO scores
- **Load time metrics**: Page load and API response times
- **Resource usage**: CPU, memory, disk usage

### Security Monitoring
- **Dependency vulnerabilities**: NPM audit results
- **Security advisories**: GitHub security alerts
- **Container scanning**: Trivy vulnerability scans

### Alert Channels
- **GitHub Issues**: Automatic issue creation on failures
- **Email**: GitHub notifications
- **Slack/Discord**: Webhook notifications (optional)

## 🔧 Local Development with CI/CD

### Running Tests Locally
```bash
# Backend tests
cd server
npm test
npm run test:coverage
npm run lint

# Frontend tests
cd client
npm test -- --coverage --watchAll=false
npm run lint
```

### Building Docker Images Locally
```bash
# Backend
cd server
docker build -t ntfg-hrms-backend .

# Frontend
cd client
docker build -t ntfg-hrms-frontend .

# Full stack
docker-compose build
```

### Deployment Scripts
```bash
# Linux/Mac
./scripts/deploy.sh staging
./scripts/deploy.sh production v1.1.0

# Windows
.\scripts\deploy.ps1 staging
.\scripts\deploy.ps1 production v1.1.0
```

## 🐛 Troubleshooting

### Common CI/CD Issues

#### 1. **Tests Failing**
```bash
# Check test logs in GitHub Actions
# Run tests locally to debug
npm test -- --verbose
```

#### 2. **Docker Build Failures**
```bash
# Check Dockerfile syntax
# Verify base image availability
# Check build context
```

#### 3. **Deployment Failures**
```bash
# Check environment variables
# Verify database connectivity
# Review deployment logs
```

#### 4. **Security Scan Failures**
```bash
# Update vulnerable dependencies
npm audit fix
# Review security advisories
# Update base Docker images
```

### Rollback Procedures

#### Automatic Rollback
- Triggered on deployment failure
- Restores previous stable version
- Includes database backup restoration

#### Manual Rollback
```bash
# Using deployment script
./scripts/deploy.sh production v1.0.0

# Using Docker
docker-compose down
git checkout v1.0.0
docker-compose up -d
```

## 📈 Performance Optimization

### CI/CD Pipeline Optimization
- **Parallel job execution**
- **Docker layer caching**
- **Dependency caching**
- **Selective testing** (changed files only)

### Build Optimization
- **Multi-stage Docker builds**
- **Asset optimization**
- **Bundle size analysis**
- **Tree shaking**

## 🔒 Security Best Practices

### Secrets Management
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Limit secret access scope
- Audit secret usage

### Container Security
- Use official base images
- Regular security scans
- Minimal container images
- Non-root user execution

### Access Control
- Branch protection rules
- Required status checks
- Review requirements
- Environment protection rules

## 📚 Additional Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)

### Monitoring Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Trivy Scanner](https://github.com/aquasecurity/trivy)
- [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories)

## 🎯 Next Steps

1. **Set up monitoring dashboards**
2. **Configure alerting channels**
3. **Implement blue-green deployments**
4. **Add integration tests**
5. **Set up performance budgets**

---

## 📞 Support

For CI/CD related issues:
1. Check GitHub Actions logs
2. Review this documentation
3. Create an issue in the repository
4. Contact the development team

**Happy Deploying! 🚀**