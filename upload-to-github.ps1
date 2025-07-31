# NTFG HRMS - GitHub Upload Script
# This script will help you upload your project to GitHub

Write-Host "🚀 NTFG HRMS - GitHub Upload Assistant" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/windows" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the correct directory
$currentDir = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the NTFG_HRMS root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Current directory: $currentDir" -ForegroundColor Blue
Write-Host ""

# Initialize Git repository if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Create or update .gitignore if needed
Write-Host "📝 Checking .gitignore file..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .gitignore file not found, but it should exist" -ForegroundColor Yellow
}

# Add all files to Git
Write-Host "📦 Adding files to Git..." -ForegroundColor Yellow
git add .

# Check Git status
Write-Host "📊 Git status:" -ForegroundColor Blue
git status --short

# Commit changes
Write-Host ""
Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Complete NTFG HRMS with AI integration

Features:
- Full-stack HRMS with React.js frontend and Node.js backend
- AI-powered resume screening and chatbot
- MongoDB database with comprehensive schemas
- JWT authentication with role-based access control
- Real-time features with Socket.IO
- Comprehensive testing and documentation
- Docker and cloud deployment ready
- 775+ files with complete implementation

Tech Stack:
- Frontend: React.js, Material-UI, Framer Motion
- Backend: Node.js, Express.js, MongoDB, Mongoose
- AI: OpenAI GPT, Hugging Face, Natural Language Processing
- Testing: Jest, Supertest
- Deployment: Docker, Heroku, AWS ready"

Write-Host "✅ Initial commit created" -ForegroundColor Green
Write-Host ""

# Instructions for GitHub upload
Write-Host "🌐 GitHub Upload Instructions:" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Create a new repository on GitHub:" -ForegroundColor Yellow
Write-Host "   • Go to https://github.com/new" -ForegroundColor White
Write-Host "   • Repository name: ntfg-hrms" -ForegroundColor White
Write-Host "   • Description: AI-Powered Human Resource Management System" -ForegroundColor White
Write-Host "   • Make it Public or Private (your choice)" -ForegroundColor White
Write-Host "   • DO NOT initialize with README, .gitignore, or license" -ForegroundColor Red
Write-Host "   • Click 'Create repository'" -ForegroundColor White
Write-Host ""

Write-Host "2. After creating the repository, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   # Add your GitHub repository as remote origin" -ForegroundColor Gray
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/ntfg-hrms.git" -ForegroundColor Green
Write-Host ""
Write-Host "   # Push to GitHub" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Green
Write-Host "   git push -u origin main" -ForegroundColor Green
Write-Host ""

Write-Host "3. Replace 'YOUR_USERNAME' with your actual GitHub username" -ForegroundColor Yellow
Write-Host ""

# Alternative: SSH method
Write-Host "📡 Alternative (SSH method):" -ForegroundColor Cyan
Write-Host "   git remote add origin git@github.com:YOUR_USERNAME/ntfg-hrms.git" -ForegroundColor Green
Write-Host "   git push -u origin main" -ForegroundColor Green
Write-Host ""

# Repository information
Write-Host "📋 Repository Information:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Repository Name: ntfg-hrms" -ForegroundColor White
Write-Host "Description: AI-Powered Human Resource Management System" -ForegroundColor White
Write-Host "Topics: hrms, ai, react, nodejs, mongodb, machine-learning, hr-management" -ForegroundColor White
Write-Host ""

# README preview
Write-Host "📖 Your repository will include:" -ForegroundColor Cyan
Write-Host "• Complete source code (775+ files)" -ForegroundColor White
Write-Host "• Comprehensive README.md" -ForegroundColor White
Write-Host "• Installation guide (INSTALLATION.md)" -ForegroundColor White
Write-Host "• Project status (PROJECT_STATUS.md)" -ForegroundColor White
Write-Host "• Docker configuration" -ForegroundColor White
Write-Host "• Deployment scripts" -ForegroundColor White
Write-Host "• Test suites" -ForegroundColor White
Write-Host "• Documentation" -ForegroundColor White
Write-Host ""

# Security reminder
Write-Host "🔒 Security Reminder:" -ForegroundColor Red
Write-Host "===================" -ForegroundColor Red
Write-Host "• The .env files are already in .gitignore" -ForegroundColor Yellow
Write-Host "• No sensitive data (API keys, passwords) will be uploaded" -ForegroundColor Yellow
Write-Host "• Demo passwords are safe to include" -ForegroundColor Yellow
Write-Host ""

# Next steps
Write-Host "🎯 After uploading to GitHub:" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "1. Add repository topics for better discoverability" -ForegroundColor White
Write-Host "2. Enable GitHub Pages for documentation (optional)" -ForegroundColor White
Write-Host "3. Set up GitHub Actions for CI/CD (optional)" -ForegroundColor White
Write-Host "4. Add collaborators if working in a team" -ForegroundColor White
Write-Host "5. Create releases for version management" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Ready to upload! Follow the instructions above." -ForegroundColor Green
Write-Host ""

# Wait for user input
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")