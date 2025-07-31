# 🚀 NTFG HRMS Installation Guide

This guide will help you set up the NTFG HRMS system on your local machine or server.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** package manager

### System Requirements

- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## 🛠️ Installation Methods

### Method 1: Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ntfg-hrms.git
   cd ntfg-hrms
   ```

2. **Run the setup script**
   ```bash
   node setup.js
   ```

   This script will:
   - Check system requirements
   - Install all dependencies
   - Create environment configuration
   - Seed the database with sample data
   - Provide next steps

3. **Start the application**
   ```bash
   npm run dev
   ```

### Method 2: Manual Setup

#### Step 1: Clone and Install

```bash
# Clone repository
git clone https://github.com/your-username/ntfg-hrms.git
cd ntfg-hrms

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

#### Step 2: Database Setup

1. **Start MongoDB**
   ```bash
   # On Linux/macOS
   sudo systemctl start mongod
   
   # On Windows (if installed as service)
   net start MongoDB
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Verify MongoDB is running**
   ```bash
   mongosh --eval "db.runCommand({ping: 1})"
   ```

#### Step 3: Environment Configuration

1. **Create server environment file**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Edit the .env file** with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ntfg_hrms
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

#### Step 4: Seed Database

```bash
cd server
npm run seed
```

#### Step 5: Start the Application

```bash
# From root directory
npm run dev
```

This will start both the server (port 5000) and client (port 3000).

### Method 3: Docker Setup

1. **Prerequisites**
   - Docker and Docker Compose installed

2. **Clone and start**
   ```bash
   git clone https://github.com/your-username/ntfg-hrms.git
   cd ntfg-hrms
   
   # Start all services
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🔧 Configuration

### Environment Variables

#### Server (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ntfg_hrms` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | `7d` | No |
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` | No |
| `OPENAI_API_KEY` | OpenAI API key for AI features | - | No |
| `HUGGINGFACE_API_KEY` | Hugging Face API key | - | No |

#### Client

The client uses environment variables prefixed with `REACT_APP_`:

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000` |
| `REACT_APP_SOCKET_URL` | Socket.IO URL | `http://localhost:5000` |

### AI Services Setup (Optional)

To enable AI features:

1. **OpenAI Integration**
   - Sign up at https://platform.openai.com/
   - Get your API key
   - Add to server `.env`: `OPENAI_API_KEY=your-key`

2. **Hugging Face Integration**
   - Sign up at https://huggingface.co/
   - Get your API key
   - Add to server `.env`: `HUGGINGFACE_API_KEY=your-key`

## 🚀 Running the Application

### Development Mode

```bash
# Start both server and client
npm run dev

# Or start individually
npm run server:dev  # Server only
npm run client:dev  # Client only
```

### Production Mode

```bash
# Build client
npm run build

# Start server
npm start
```

## 👥 Default Accounts

After seeding, you can log in with these demo accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@ntfg.com | admin123 | Full system access |
| HR Manager | hr@ntfg.com | hr123 | HR operations |
| Manager | manager@ntfg.com | manager123 | Team management |
| Employee | employee@ntfg.com | employee123 | Basic access |

## 🔍 Verification

### Health Checks

1. **Server Health**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Database Connection**
   ```bash
   mongosh ntfg_hrms --eval "db.users.countDocuments()"
   ```

3. **Client Access**
   - Open http://localhost:3000
   - Should see the login page

### Common URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health
- **API Documentation**: http://localhost:5000/api-docs (if enabled)

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

**Error**: `MongoNetworkError: failed to connect to server`

**Solutions**:
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- Try connecting manually: `mongosh`

#### 2. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
- Kill process using port: `lsof -ti:5000 | xargs kill -9`
- Change port in `.env`: `PORT=5001`

#### 3. Node.js Version Error

**Error**: `The engine "node" is incompatible with this module`

**Solutions**:
- Update Node.js to v16+
- Check version: `node --version`

#### 4. Permission Errors

**Error**: `EACCES: permission denied`

**Solutions**:
- Use `sudo` for global installs
- Fix npm permissions: `npm config set prefix ~/.npm-global`

#### 5. Build Errors

**Error**: Build fails with memory issues

**Solutions**:
- Increase Node.js memory: `export NODE_OPTIONS="--max-old-space-size=4096"`
- Clear cache: `npm cache clean --force`

### Getting Help

1. **Check logs**
   ```bash
   # Server logs
   cd server && npm run dev
   
   # Client logs
   cd client && npm start
   ```

2. **Database logs**
   ```bash
   # MongoDB logs (Linux)
   sudo tail -f /var/log/mongodb/mongod.log
   ```

3. **Clear everything and restart**
   ```bash
   npm run clean
   npm run install:all
   npm run dev
   ```

## 📚 Next Steps

After successful installation:

1. **Explore the Dashboard** - Log in and familiarize yourself with the interface
2. **Configure AI Services** - Set up OpenAI/Hugging Face for AI features
3. **Customize Settings** - Modify configurations for your organization
4. **Import Data** - Replace sample data with your actual HR data
5. **Set up Production** - Configure for production deployment

## 🔒 Security Considerations

For production deployment:

1. **Change default passwords** for all demo accounts
2. **Use strong JWT secrets** (64+ characters)
3. **Enable HTTPS** with SSL certificates
4. **Configure firewall** rules
5. **Set up monitoring** and logging
6. **Regular backups** of database
7. **Update dependencies** regularly

## 📞 Support

If you encounter issues:

- **Documentation**: Check the main README.md
- **Issues**: Create a GitHub issue
- **Email**: support@ntfg.com
- **Community**: Join our Discord server

---

**Happy coding! 🚀**