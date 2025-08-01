# NTFG HRMS Deployment Script (PowerShell)
# This script handles deployment to different environments on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("staging", "production", "development")]
    [string]$Environment = "staging",
    
    [Parameter(Position=1)]
    [string]$Version = "latest"
)

# Configuration
$ComposeFile = "docker-compose.yml"
$BackupDir = "backups"

# Functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Docker
    try {
        docker --version | Out-Null
    }
    catch {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }
    
    # Check Docker Compose
    try {
        docker-compose --version | Out-Null
    }
    catch {
        Write-Error "Docker Compose is not installed or not in PATH"
        exit 1
    }
    
    # Check environment file
    $envFile = "server\.env.$Environment"
    $defaultEnvFile = "server\.env"
    
    if (-not (Test-Path $envFile) -and -not (Test-Path $defaultEnvFile)) {
        Write-Error "Environment file not found: $envFile or $defaultEnvFile"
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Backup current deployment
function Backup-Deployment {
    Write-Info "Creating backup of current deployment..."
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "$BackupDir\$timestamp"
    
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    
    # Backup database
    $mongoContainer = docker-compose ps -q mongodb
    if ($mongoContainer) {
        Write-Info "Backing up MongoDB..."
        docker-compose exec -T mongodb mongodump --out /tmp/backup
        docker cp "${mongoContainer}:/tmp/backup" "$backupPath\mongodb"
    }
    
    # Backup uploaded files
    if (Test-Path "uploads") {
        Copy-Item -Path "uploads" -Destination "$backupPath\uploads" -Recurse
    }
    
    Write-Success "Backup created at $backupPath"
    return $backupPath
}

# Pull latest images
function Update-Images {
    Write-Info "Pulling latest Docker images..."
    
    if ($Version -ne "latest") {
        # Update image tags in docker-compose.yml for specific version
        $content = Get-Content $ComposeFile
        $content = $content -replace ":latest", ":$Version"
        $content | Set-Content "$ComposeFile.bak"
        $content | Set-Content $ComposeFile
    }
    
    docker-compose pull
    Write-Success "Images pulled successfully"
}

# Deploy application
function Deploy-Application {
    Write-Info "Deploying application..."
    
    # Set environment file
    $envFile = "server\.env.$Environment"
    if (Test-Path $envFile) {
        Copy-Item $envFile "server\.env"
        Write-Info "Using environment file: $envFile"
    }
    
    # Start services
    docker-compose up -d
    
    Write-Success "Application deployed successfully"
}

# Health check
function Test-ApplicationHealth {
    Write-Info "Performing health checks..."
    
    # Wait for services to start
    Start-Sleep -Seconds 30
    
    # Check backend health
    $backendUrl = "http://localhost:5000/api/health"
    try {
        $response = Invoke-WebRequest -Uri $backendUrl -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend health check passed"
        } else {
            throw "Backend returned status code: $($response.StatusCode)"
        }
    }
    catch {
        Write-Error "Backend health check failed: $_"
        return $false
    }
    
    # Check frontend
    $frontendUrl = "http://localhost:3000"
    try {
        $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend health check passed"
        } else {
            throw "Frontend returned status code: $($response.StatusCode)"
        }
    }
    catch {
        Write-Error "Frontend health check failed: $_"
        return $false
    }
    
    Write-Success "All health checks passed"
    return $true
}

# Rollback function
function Invoke-Rollback {
    param([string]$BackupPath)
    
    Write-Warning "Rolling back deployment..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup if available
    if ($BackupPath -and (Test-Path $BackupPath)) {
        Write-Info "Restoring from backup: $BackupPath"
        
        # Restore database
        $mongoBackup = "$BackupPath\mongodb"
        if (Test-Path $mongoBackup) {
            docker-compose up -d mongodb
            Start-Sleep -Seconds 10
            $mongoContainer = docker-compose ps -q mongodb
            docker cp $mongoBackup "${mongoContainer}:/tmp/restore"
            docker-compose exec -T mongodb mongorestore /tmp/restore
        }
        
        # Restore files
        $uploadsBackup = "$BackupPath\uploads"
        if (Test-Path $uploadsBackup) {
            if (Test-Path "uploads") {
                Remove-Item -Path "uploads" -Recurse -Force
            }
            Copy-Item -Path $uploadsBackup -Destination "uploads" -Recurse
        }
    }
    
    # Restore previous docker-compose.yml
    if (Test-Path "$ComposeFile.bak") {
        Move-Item "$ComposeFile.bak" $ComposeFile -Force
    }
    
    # Start with previous configuration
    docker-compose up -d
    
    Write-Success "Rollback completed"
}

# Cleanup old backups
function Remove-OldBackups {
    Write-Info "Cleaning up old backups..."
    
    # Keep only last 5 backups
    if (Test-Path $BackupDir) {
        $backups = Get-ChildItem $BackupDir | Sort-Object CreationTime -Descending
        if ($backups.Count -gt 5) {
            $backups | Select-Object -Skip 5 | Remove-Item -Recurse -Force
        }
    }
    
    # Clean up old Docker images
    docker image prune -f
    
    Write-Success "Cleanup completed"
}

# Main deployment process
function Start-Deployment {
    Write-Info "Starting NTFG HRMS deployment..."
    Write-Info "Environment: $Environment"
    Write-Info "Version: $Version"
    
    Test-Prerequisites
    
    # Create backups directory
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    $backupPath = $null
    
    try {
        $backupPath = Backup-Deployment
        Update-Images
        Deploy-Application
        
        if (-not (Test-ApplicationHealth)) {
            throw "Health checks failed"
        }
        
        Remove-OldBackups
        
        Write-Success "🎉 Deployment completed successfully!"
        Write-Info "Application is running at:"
        Write-Info "  Frontend: http://localhost:3000"
        Write-Info "  Backend:  http://localhost:5000"
        Write-Info "  API Docs: http://localhost:5000/api-docs"
    }
    catch {
        Write-Error "Deployment failed: $_"
        Write-Error "Starting rollback..."
        Invoke-Rollback -BackupPath $backupPath
        exit 1
    }
}

# Script usage
function Show-Usage {
    Write-Host "Usage: .\deploy.ps1 [environment] [version]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  environment  Target environment (staging|production|development) [default: staging]"
    Write-Host "  version      Docker image version [default: latest]"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1 staging"
    Write-Host "  .\deploy.ps1 production v1.2.0"
    Write-Host "  .\deploy.ps1 development latest"
}

# Handle help parameter
if ($args -contains "-h" -or $args -contains "--help") {
    Show-Usage
    exit 0
}

# Run main function
Start-Deployment