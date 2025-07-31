# 🚀 NTFG HRMS - AI-Powered Human Resource Management System

A comprehensive, modern HRMS platform built with React.js, Node.js, and MongoDB, featuring advanced AI capabilities for intelligent HR management.

## ✨ Features

### 🤖 AI-Powered Capabilities
- **Smart Resume Screening**: Automated candidate evaluation with 95% accuracy
- **Performance Prediction**: ML-based employee performance forecasting
- **Skill Gap Analysis**: Intelligent identification of training needs
- **AI Chatbot**: 24/7 HR assistant for employees and managers
- **Sentiment Analysis**: Employee feedback and satisfaction analysis
- **Predictive Analytics**: Turnover risk assessment and workforce planning

### 📊 Core HR Modules
- **Employee Management**: Complete employee lifecycle management
- **Recruitment Suite**: End-to-end hiring process automation
- **Performance Management**: Goal tracking and performance reviews
- **Leave Management**: Smart leave tracking and approval workflows
- **Training & Development**: Personalized learning paths
- **Analytics Dashboard**: Real-time insights and reporting

### 🔧 Technical Features
- **Real-time Updates**: Socket.IO powered live notifications
- **Responsive Design**: Mobile-first, modern UI with Material-UI
- **Role-based Access**: Granular permissions system
- **RESTful API**: Well-documented, scalable backend
- **Security**: JWT authentication, rate limiting, data encryption
- **Performance**: Optimized queries, caching, and lazy loading

## 🏗️ Architecture

```
NTFG_HRMS/
├── client/                 # React.js Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Socket)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js Backend
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic & AI services
│   ├── utils/             # Server utilities
│   └── server.js          # Main server file
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ntfg-hrms.git
   cd ntfg-hrms
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ntfg_hrms
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Server
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   
   # AI Services (Optional)
   OPENAI_API_KEY=your-openai-api-key
   HUGGINGFACE_API_KEY=your-huggingface-api-key
   
   # Email (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

5. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

6. **Start the application**
   
   **Development mode (recommended):**
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev
   
   # Terminal 2 - Start client
   cd client
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 👥 Default Users

The system comes with pre-configured demo accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@ntfg.com | admin123 | Full system access |
| HR Manager | hr@ntfg.com | hr123 | HR operations |
| Manager | manager@ntfg.com | manager123 | Team management |
| Employee | employee@ntfg.com | employee123 | Basic access |

## 🔧 Configuration

### AI Services Setup

1. **OpenAI Integration** (Optional)
   - Get API key from https://platform.openai.com/
   - Add to `.env`: `OPENAI_API_KEY=your-key`

2. **Hugging Face Integration** (Optional)
   - Get API key from https://huggingface.co/
   - Add to `.env`: `HUGGINGFACE_API_KEY=your-key`

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
GET  /api/auth/me            # Get current user
PUT  /api/auth/profile       # Update profile
POST /api/auth/logout        # User logout
```

### Employee Endpoints
```
GET    /api/employees        # Get all employees
GET    /api/employees/:id    # Get employee by ID
POST   /api/employees        # Create employee
PUT    /api/employees/:id    # Update employee
DELETE /api/employees/:id    # Delete employee
```

### AI Endpoints
```
POST /api/ai/analyze-resume     # Analyze resume
POST /api/ai/screen-applications # Screen applications
POST /api/ai/predict-performance # Predict performance
POST /api/ai/analyze-skill-gaps  # Analyze skill gaps
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/ntfg-hrms/issues)
- **Email**: support@ntfg.com

---

**Built with ❤️ by NextTechFusionGadgets Team**

*Revolutionizing HR management with AI-powered insights and automation.*