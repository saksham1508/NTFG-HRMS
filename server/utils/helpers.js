const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { logger } = require('../middleware/logger');

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate UUID
const generateUUID = () => {
  return crypto.randomUUID();
};

// Hash password
const hashPassword = async (password) => {
  const bcrypt = require('bcryptjs');
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate employee ID
const generateEmployeeId = (department, sequence) => {
  const deptCode = department.substring(0, 3).toUpperCase();
  const seqStr = sequence.toString().padStart(3, '0');
  return `NTFG-${deptCode}-${seqStr}`;
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
const formatDate = (date, locale = 'en-US', options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
};

// Calculate age
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate work experience
const calculateWorkExperience = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  
  let totalMonths = years * 12 + months;
  
  if (end.getDate() < start.getDate()) {
    totalMonths--;
  }
  
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    totalMonths
  };
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Generate pagination metadata
const generatePaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
};

// Create email transporter
const createEmailTransporter = () => {
  if (!process.env.SMTP_HOST) {
    logger.warn('SMTP configuration not found, email functionality disabled');
    return null;
  }
  
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send email
const sendEmail = async (to, subject, html, attachments = []) => {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    throw new Error('Email service not configured');
  }
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
    attachments
  };
  
  try {
    const result = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { to, subject, messageId: result.messageId });
    return result;
  } catch (error) {
    logger.error('Email sending failed', { to, subject, error: error.message });
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Welcome to NTFG HRMS!</h2>
      <p>Dear ${user.profile.firstName} ${user.profile.lastName},</p>
      <p>Welcome to NextTechFusionGadgets Human Resource Management System. Your account has been successfully created.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Account Details:</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Employee ID:</strong> ${user.employment?.employeeId || 'N/A'}</p>
      </div>
      
      <p>You can now log in to the system and explore all the features available to you.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/login" 
           style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Login to HRMS
        </a>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact our HR team.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This is an automated message from NTFG HRMS. Please do not reply to this email.
      </p>
    </div>
  `;
  
  return await sendEmail(user.email, 'Welcome to NTFG HRMS', html);
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Password Reset Request</h2>
      <p>Dear ${user.profile.firstName} ${user.profile.lastName},</p>
      <p>You have requested to reset your password for your NTFG HRMS account.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This is an automated message from NTFG HRMS. Please do not reply to this email.
      </p>
    </div>
  `;
  
  return await sendEmail(user.email, 'Password Reset Request - NTFG HRMS', html);
};

// Send job application notification
const sendJobApplicationNotification = async (application, jobPosting) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">New Job Application Received</h2>
      <p>A new application has been submitted for the following position:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${jobPosting.title}</h3>
        <p><strong>Department:</strong> ${jobPosting.department}</p>
        <p><strong>Location:</strong> ${jobPosting.location}</p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Applicant Details:</h3>
        <p><strong>Name:</strong> ${application.applicantName}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Phone:</strong> ${application.phone}</p>
        <p><strong>Experience:</strong> ${application.experience || 'Not specified'} years</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/recruitment/applications/${application._id}" 
           style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Review Application
        </a>
      </div>
    </div>
  `;
  
  // Send to HR team (you would get HR emails from database)
  const hrEmails = ['hr@ntfg.com']; // This should come from database
  
  for (const email of hrEmails) {
    await sendEmail(email, `New Application: ${jobPosting.title}`, html);
  }
};

// Calculate business days between dates
const calculateBusinessDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;
  
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return businessDays;
};

// Generate report filename
const generateReportFilename = (type, format = 'pdf', timestamp = new Date()) => {
  const dateStr = timestamp.toISOString().split('T')[0];
  const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${type}-report-${dateStr}-${timeStr}.${format}`;
};

// Mask sensitive data
const maskSensitiveData = (data, fields = ['password', 'ssn', 'bankAccount']) => {
  const masked = { ...data };
  
  fields.forEach(field => {
    if (masked[field]) {
      const value = masked[field].toString();
      if (value.length > 4) {
        masked[field] = '*'.repeat(value.length - 4) + value.slice(-4);
      } else {
        masked[field] = '*'.repeat(value.length);
      }
    }
  });
  
  return masked;
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Convert bytes to human readable format
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

module.exports = {
  generateRandomString,
  generateUUID,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateEmployeeId,
  formatCurrency,
  formatDate,
  calculateAge,
  calculateWorkExperience,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  generatePaginationMeta,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendJobApplicationNotification,
  calculateBusinessDays,
  generateReportFilename,
  maskSensitiveData,
  deepClone,
  debounce,
  throttle,
  formatBytes
};