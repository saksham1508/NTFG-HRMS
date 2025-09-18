const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path'); // Needed for serving client build in production
require('dotenv').config();
// Dev fallback DB and hashing
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

// Import middleware
const { authMiddleware } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');
const chatbotRoutes = require('./routes/chatbot');

// Import services
const AIService = require('./services/aiService');

const app = express();
const server = createServer(app);

// Trust proxy - required for express-rate-limit when behind a proxy
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (skip noisy dev assets)
app.use((req, res, next) => {
  const p = req.path || '';
  if (p.endsWith('.hot-update.json') || p.includes('__webpack_hmr') || p === '/favicon.ico') {
    return next();
  }
  console.log(`${new Date().toISOString()} - ${req.method} ${p}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NTFG HRMS Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', authMiddleware, employeeRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/chatbot', authMiddleware, chatbotRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Simple placeholder image endpoint to avoid 404 noise from UI demos
// Usage: /api/placeholder/:w/:h -> returns a PNG with given width and height
app.get('/api/placeholder/:w/:h', (req, res) => {
  const width = Math.max(1, Math.min(parseInt(req.params.w, 10) || 100, 2000));
  const height = Math.max(1, Math.min(parseInt(req.params.h, 10) || 100, 2000));
  const text = `${width}x${height}`;
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
    <rect width='100%' height='100%' fill='#e5e7eb'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='${Math.max(10, Math.min(width, height) / 5)}' fill='#6b7280'>${text}</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  // Cache aggressively to avoid repeated hits from the UI
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(svg);
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', (token) => {
    // TODO: Verify JWT token and associate socket with user
    console.log('User authenticated:', socket.id);
  });

  // Handle joining rooms
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Handle leaving rooms
  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  // Handle chatbot messages
  socket.on('chatbot_message', async (data) => {
    try {
      // Process message with AI service
      const response = await AIService.processNaturalLanguageQuery(data.message, {
        userId: data.userId,
        conversationId: data.conversationId
      });

      // Send response back to user
      socket.emit('chatbot_response', {
        conversationId: data.conversationId,
        message: response.response,
        intent: response.intent,
        confidence: response.confidence
      });
    } catch (error) {
      console.error('Chatbot message error:', error);
      socket.emit('chatbot_error', {
        message: 'Sorry, I encountered an error processing your message.'
      });
    }
  });

  // Handle real-time notifications
  socket.on('send_notification', (data) => {
    if (data.room) {
      socket.to(data.room).emit('notification', data.notification);
    } else {
      socket.broadcast.emit('notification', data.notification);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Database connection
const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      // Try local MongoDB first
      mongoURI = 'mongodb://localhost:27017/ntfg_hrms';
    }

    try {
      // Connect using modern defaults (deprecated flags removed)
      await mongoose.connect(mongoURI);
      console.log('✅ MongoDB connected:', mongoURI);
    } catch (connErr) {
      // Fallback to in-memory MongoDB for development
      console.warn('⚠️  MongoDB not available, starting in-memory MongoDB for development...');
      const mem = await MongoMemoryServer.create();
      const memUri = mem.getUri('ntfg_hrms');
      await mongoose.connect(memUri);
      console.log('✅ Connected to in-memory MongoDB');

      // Seed minimal demo users if collection is empty
      const User = require('./models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        const users = [
          {
            employeeId: 'NTFG-HR-001',
            email: 'hr@ntfg.com',
            password: await bcrypt.hash('hr123', 10),
            role: 'hr',
            profile: { firstName: 'Sarah', lastName: 'Johnson', phone: '+1-555-0002' },
            employment: { department: 'Human Resources', position: 'HR Manager', hireDate: new Date('2023-02-01'), status: 'active' },
            permissions: ['manage_employees','manage_recruitment','view_analytics','use_ai_features'],
            isActive: true,
          },
          {
            employeeId: 'NTFG-ADMIN-001',
            email: 'admin@ntfg.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            profile: { firstName: 'System', lastName: 'Administrator', phone: '+1-555-0001' },
            employment: { department: 'IT', position: 'System Administrator', hireDate: new Date('2023-01-01'), status: 'active' },
            permissions: ['manage_users','manage_employees','manage_recruitment','view_analytics','use_ai_features','manage_system'],
            isActive: true,
          },
        ];
        await User.insertMany(users);
        console.log('🌱 Seeded demo users into in-memory DB');
      }
    }

    // Initialize AI Service after DB connection
    await AIService.initialize();
    console.log('✅ AI Service initialized');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('🔌 HTTP server closed');
    
    mongoose.connection.close(false, () => {
      console.log('🗄️  MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`
🚀 NTFG HRMS Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health Check: http://localhost:${PORT}/health
📊 Socket.IO: Enabled
🤖 AI Services: ${AIService.getServiceStatus().initialized ? 'Active' : 'Initializing...'}
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };