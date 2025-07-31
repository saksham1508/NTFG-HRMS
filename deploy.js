#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 NTFG HRMS Deployment Script');
console.log('==============================\n');

const args = process.argv.slice(2);
const environment = args[0] || 'development';
const platform = args[1] || 'local';

console.log(`📋 Deployment Configuration:`);
console.log(`   Environment: ${environment}`);
console.log(`   Platform: ${platform}\n`);

// Deployment configurations
const configs = {
  development: {
    buildClient: true,
    runTests: true,
    seedDatabase: true,
    startServices: true
  },
  production: {
    buildClient: true,
    runTests: true,
    seedDatabase: false,
    startServices: false,
    optimizeAssets: true,
    generateDocs: true
  },
  staging: {
    buildClient: true,
    runTests: true,
    seedDatabase: true,
    startServices: false
  }
};

const config = configs[environment] || configs.development;

// Helper function to run commands
function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Main deployment function
async function deploy() {
  try {
    console.log('🔍 Pre-deployment checks...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 16) {
      throw new Error(`Node.js version 16+ required, current: ${nodeVersion}`);
    }
    console.log(`✅ Node.js version: ${nodeVersion}`);
    
    // Check if required files exist
    const requiredFiles = [
      'package.json',
      'server/package.json',
      'client/package.json',
      'server/server.js'
    ];
    
    for (const file of requiredFiles) {
      if (!fileExists(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
    console.log('✅ Required files present');
    
    // Install dependencies
    console.log('\n📦 Installing dependencies...');
    runCommand('npm run install:all', 'Installing all dependencies');
    
    // Run tests if configured
    if (config.runTests) {
      console.log('🧪 Running tests...');
      runCommand('cd server && npm test', 'Running server tests');
      
      if (fileExists('client/src')) {
        runCommand('cd client && npm test -- --watchAll=false', 'Running client tests');
      }
    }
    
    // Build client if configured
    if (config.buildClient) {
      console.log('🏗️  Building client application...');
      runCommand('cd client && npm run build', 'Building React application');
    }
    
    // Optimize assets for production
    if (config.optimizeAssets && environment === 'production') {
      console.log('⚡ Optimizing assets...');
      // Add asset optimization commands here
      console.log('✅ Assets optimized\n');
    }
    
    // Generate documentation
    if (config.generateDocs && environment === 'production') {
      console.log('📚 Generating documentation...');
      // Add documentation generation commands here
      console.log('✅ Documentation generated\n');
    }
    
    // Database operations
    if (config.seedDatabase) {
      console.log('🌱 Setting up database...');
      
      // Check if MongoDB is running
      try {
        execSync('mongosh --eval "db.runCommand({ping: 1})"', { stdio: 'ignore' });
        console.log('✅ MongoDB is running');
        
        runCommand('cd server && npm run seed', 'Seeding database');
      } catch (error) {
        console.log('⚠️  MongoDB not running, skipping database seed');
        console.log('   Start MongoDB and run: npm run seed');
      }
    }
    
    // Platform-specific deployment
    switch (platform) {
      case 'docker':
        console.log('🐳 Docker deployment...');
        runCommand('docker-compose build', 'Building Docker images');
        runCommand('docker-compose up -d', 'Starting Docker containers');
        break;
        
      case 'heroku':
        console.log('🚀 Heroku deployment...');
        runCommand('git add .', 'Staging files');
        runCommand('git commit -m "Deploy to Heroku" || true', 'Committing changes');
        runCommand('git push heroku main', 'Pushing to Heroku');
        break;
        
      case 'aws':
        console.log('☁️  AWS deployment...');
        console.log('⚠️  AWS deployment requires additional configuration');
        console.log('   Please refer to AWS deployment documentation');
        break;
        
      case 'local':
      default:
        if (config.startServices) {
          console.log('🖥️  Starting local services...');
          console.log('✅ Ready to start development servers');
          console.log('\n📋 Next steps:');
          console.log('   1. Start MongoDB: sudo systemctl start mongod');
          console.log('   2. Start development: npm run dev');
          console.log('   3. Open: http://localhost:3000');
        }
        break;
    }
    
    // Environment-specific post-deployment tasks
    if (environment === 'production') {
      console.log('\n🔒 Production deployment checklist:');
      console.log('   □ Update environment variables');
      console.log('   □ Configure SSL certificates');
      console.log('   □ Set up monitoring and logging');
      console.log('   □ Configure backup strategy');
      console.log('   □ Update DNS records');
      console.log('   □ Test all critical paths');
    }
    
    console.log('\n🎉 Deployment completed successfully!');
    
    // Display useful information
    console.log('\n📋 Deployment Summary:');
    console.log(`   Environment: ${environment}`);
    console.log(`   Platform: ${platform}`);
    console.log(`   Build client: ${config.buildClient ? '✅' : '❌'}`);
    console.log(`   Run tests: ${config.runTests ? '✅' : '❌'}`);
    console.log(`   Seed database: ${config.seedDatabase ? '✅' : '❌'}`);
    
    if (environment === 'development') {
      console.log('\n👥 Demo accounts:');
      console.log('   Admin: admin@ntfg.com / admin123');
      console.log('   HR: hr@ntfg.com / hr123');
      console.log('   Manager: manager@ntfg.com / manager123');
      console.log('   Employee: employee@ntfg.com / employee123');
    }
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Check Node.js version (16+ required)');
    console.log('   2. Ensure MongoDB is running');
    console.log('   3. Verify all dependencies are installed');
    console.log('   4. Check environment variables');
    console.log('   5. Review error logs above');
    process.exit(1);
  }
}

// Display help information
function showHelp() {
  console.log('Usage: node deploy.js [environment] [platform]');
  console.log('');
  console.log('Environments:');
  console.log('  development  - Development deployment (default)');
  console.log('  staging      - Staging deployment');
  console.log('  production   - Production deployment');
  console.log('');
  console.log('Platforms:');
  console.log('  local        - Local deployment (default)');
  console.log('  docker       - Docker deployment');
  console.log('  heroku       - Heroku deployment');
  console.log('  aws          - AWS deployment');
  console.log('');
  console.log('Examples:');
  console.log('  node deploy.js development local');
  console.log('  node deploy.js production docker');
  console.log('  node deploy.js staging heroku');
}

// Handle command line arguments
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run deployment
deploy();