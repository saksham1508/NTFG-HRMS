const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'ntfg-hrms' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs to access.log for request logging
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.http('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.http('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Application error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      body: req.body,
      params: req.params,
      query: req.query
    },
    timestamp: new Date().toISOString()
  });

  next(err);
};

// Security event logger
const securityLogger = (event, details, req) => {
  logger.warn('Security event', {
    event,
    details,
    request: {
      method: req?.method,
      url: req?.url,
      ip: req?.ip,
      userAgent: req?.get('User-Agent'),
      userId: req?.user?.id
    },
    timestamp: new Date().toISOString()
  });
};

// Performance logger
const performanceLogger = (operation, duration, metadata = {}) => {
  logger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    metadata,
    timestamp: new Date().toISOString()
  });
};

// Database operation logger
const dbLogger = (operation, collection, query, duration) => {
  logger.debug('Database operation', {
    operation,
    collection,
    query: JSON.stringify(query),
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  });
};

// AI operation logger
const aiLogger = (operation, model, input, output, duration) => {
  logger.info('AI operation', {
    operation,
    model,
    inputSize: typeof input === 'string' ? input.length : JSON.stringify(input).length,
    outputSize: typeof output === 'string' ? output.length : JSON.stringify(output).length,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  });
};

// User activity logger
const userActivityLogger = (userId, action, resource, details = {}) => {
  logger.info('User activity', {
    userId,
    action,
    resource,
    details,
    timestamp: new Date().toISOString()
  });
};

// System health logger
const healthLogger = (component, status, metrics = {}) => {
  logger.info('System health', {
    component,
    status,
    metrics,
    timestamp: new Date().toISOString()
  });
};

// Rate limit logger
const rateLimitLogger = (req, limit, remaining, resetTime) => {
  logger.warn('Rate limit info', {
    ip: req.ip,
    url: req.url,
    limit,
    remaining,
    resetTime,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
};

// Authentication logger
const authLogger = (event, userId, email, ip, success = true, reason = null) => {
  const level = success ? 'info' : 'warn';
  
  logger.log(level, 'Authentication event', {
    event,
    userId,
    email,
    ip,
    success,
    reason,
    timestamp: new Date().toISOString()
  });
};

// File operation logger
const fileLogger = (operation, filename, size, userId, success = true, error = null) => {
  const level = success ? 'info' : 'error';
  
  logger.log(level, 'File operation', {
    operation,
    filename,
    size,
    userId,
    success,
    error: error?.message,
    timestamp: new Date().toISOString()
  });
};

// Export logger and middleware
module.exports = {
  logger,
  requestLogger,
  errorLogger,
  securityLogger,
  performanceLogger,
  dbLogger,
  aiLogger,
  userActivityLogger,
  healthLogger,
  rateLimitLogger,
  authLogger,
  fileLogger
};