#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 NTFG HRMS Setup Script');
console.log('========================\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if MongoDB is running
function checkMongoDB() {
  try {
    execSync('mongosh --eval "db.runCommand({ping: 1})"', { stdio: 'ignore' });
    console.log('✅ MongoDB is running');
    return true;
  } catch (error) {
    console.log('⚠️  MongoDB is not running or not installed');
    console.log('   Please install and start MongoDB:');
    console.log('   - Install: https://docs.mongodb.com/manual/installation/');
    console.log('   - Start: sudo systemctl start mongod (Linux)');
    console.log('   - Or use Docker: docker run -d -p 27017:27017 mongo:latest');
    return false;
  }
}

// Create environment file
function createEnvFile() {
  const envPath = path.join(__dirname, 'server', '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    return;
  }

  const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ntfg_hrms

# JWT Configuration
JWT_SECRET=${generateRandomString(64)}
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# AI Services Configuration (Optional)
# OPENAI_API_KEY=your-openai-api-key-here
# HUGGINGFACE_API_KEY=your-huggingface-api-key-here

# Email Configuration (Optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# File Upload Configuration (Optional)
# CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
# CLOUDINARY_API_KEY=your-cloudinary-api-key
# CLOUDINARY_API_SECRET=your-cloudinary-api-secret
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration');
}

// Generate random string for JWT secret
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Install dependencies
function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    console.log('Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('Installing server dependencies...');
    execSync('cd server && npm install', { stdio: 'inherit' });
    
    console.log('Installing client dependencies...');
    execSync('cd client && npm install', { stdio: 'inherit' });
    
    console.log('✅ All dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Seed database
function seedDatabase() {
  console.log('\n🌱 Seeding database with sample data...');
  
  try {
    execSync('cd server && npm run seed', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed database:', error.message);
    console.log('You can run "npm run seed" later from the server directory');
  }
}

// Main setup function
async function setup() {
  try {
    // Check MongoDB
    const mongoRunning = checkMongoDB();
    
    // Create environment file
    createEnvFile();
    
    // Install dependencies
    installDependencies();
    
    // Seed database if MongoDB is running
    if (mongoRunning) {
      seedDatabase();
    }
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start MongoDB if not running');
    console.log('2. Run "npm run dev" to start both server and client');
    console.log('3. Open http://localhost:3000 in your browser');
    console.log('\n👥 Demo accounts:');
    console.log('Admin: admin@ntfg.com / admin123');
    console.log('HR: hr@ntfg.com / hr123');
    console.log('Manager: manager@ntfg.com / manager123');
    console.log('Employee: employee@ntfg.com / employee123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setup();