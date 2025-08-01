#!/bin/bash

# NTFG HRMS Deployment Script
# This script handles deployment to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
COMPOSE_FILE="docker-compose.yml"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        staging|production|development)
            log_info "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_info "Valid environments: staging, production, development"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f "server/.env.${ENVIRONMENT}" ] && [ ! -f "server/.env" ]; then
        log_error "Environment file not found: server/.env.${ENVIRONMENT} or server/.env"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Backup current deployment
backup_deployment() {
    log_info "Creating backup of current deployment..."
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker-compose ps | grep -q mongodb; then
        log_info "Backing up MongoDB..."
        docker-compose exec -T mongodb mongodump --out /tmp/backup
        docker cp $(docker-compose ps -q mongodb):/tmp/backup "$BACKUP_DIR/mongodb"
    fi
    
    # Backup uploaded files
    if [ -d "uploads" ]; then
        cp -r uploads "$BACKUP_DIR/"
    fi
    
    log_success "Backup created at $BACKUP_DIR"
}

# Pull latest images
pull_images() {
    log_info "Pulling latest Docker images..."
    
    if [ "$VERSION" != "latest" ]; then
        # Update image tags in docker-compose.yml for specific version
        sed -i.bak "s|:latest|:$VERSION|g" $COMPOSE_FILE
    fi
    
    docker-compose pull
    log_success "Images pulled successfully"
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    # Set environment file
    if [ -f "server/.env.${ENVIRONMENT}" ]; then
        cp "server/.env.${ENVIRONMENT}" "server/.env"
        log_info "Using environment file: server/.env.${ENVIRONMENT}"
    fi
    
    # Start services
    docker-compose up -d
    
    log_success "Application deployed successfully"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    BACKEND_URL="http://localhost:5000/api/health"
    if curl -f "$BACKEND_URL" > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    FRONTEND_URL="http://localhost:3000"
    if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    log_success "All health checks passed"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup if available
    LATEST_BACKUP=$(ls -t backups/ | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Restoring from backup: $LATEST_BACKUP"
        
        # Restore database
        if [ -d "backups/$LATEST_BACKUP/mongodb" ]; then
            docker-compose up -d mongodb
            sleep 10
            docker cp "backups/$LATEST_BACKUP/mongodb" $(docker-compose ps -q mongodb):/tmp/restore
            docker-compose exec -T mongodb mongorestore /tmp/restore
        fi
        
        # Restore files
        if [ -d "backups/$LATEST_BACKUP/uploads" ]; then
            rm -rf uploads
            cp -r "backups/$LATEST_BACKUP/uploads" .
        fi
    fi
    
    # Restore previous docker-compose.yml
    if [ -f "${COMPOSE_FILE}.bak" ]; then
        mv "${COMPOSE_FILE}.bak" "$COMPOSE_FILE"
    fi
    
    # Start with previous configuration
    docker-compose up -d
    
    log_success "Rollback completed"
}

# Cleanup old backups
cleanup_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep only last 5 backups
    if [ -d "backups" ]; then
        cd backups
        ls -t | tail -n +6 | xargs -r rm -rf
        cd ..
    fi
    
    # Clean up old Docker images
    docker image prune -f
    
    log_success "Cleanup completed"
}

# Main deployment process
main() {
    log_info "Starting NTFG HRMS deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    validate_environment
    check_prerequisites
    
    # Create backups directory
    mkdir -p backups
    
    # Trap for rollback on failure
    trap 'log_error "Deployment failed! Starting rollback..."; rollback; exit 1' ERR
    
    backup_deployment
    pull_images
    deploy_application
    
    if ! health_check; then
        log_error "Health checks failed! Starting rollback..."
        rollback
        exit 1
    fi
    
    cleanup_backups
    
    log_success "🎉 Deployment completed successfully!"
    log_info "Application is running at:"
    log_info "  Frontend: http://localhost:3000"
    log_info "  Backend:  http://localhost:5000"
    log_info "  API Docs: http://localhost:5000/api-docs"
}

# Script usage
usage() {
    echo "Usage: $0 [environment] [version]"
    echo ""
    echo "Arguments:"
    echo "  environment  Target environment (staging|production|development) [default: staging]"
    echo "  version      Docker image version [default: latest]"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 production v1.2.0"
    echo "  $0 development latest"
}

# Handle script arguments
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

# Run main function
main