const express = require('express');
const { body, validationResult } = require('express-validator');
const AIService = require('../services/aiService');
const User = require('../models/User');

const router = express.Router();

// Store conversation history (in production, use Redis or database)
const conversationHistory = new Map();

// @route   POST /api/chatbot/message
// @desc    Process chatbot message
// @access  Private
router.post('/message', [
  body('message').notEmpty().withMessage('Message is required'),
  body('conversationId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { message, conversationId } = req.body;
    const userId = req.user._id.toString();
    
    // Get or create conversation ID
    const convId = conversationId || `${userId}_${Date.now()}`;
    
    // Get conversation history
    let history = conversationHistory.get(convId) || [];
    
    // Add user message to history
    history.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Prepare context for AI
    const context = {
      user: {
        id: req.user._id,
        name: req.user.fullName,
        role: req.user.role,
        department: req.user.employment.department,
        position: req.user.employment.position
      },
      conversationHistory: history.slice(-10) // Last 10 messages for context
    };

    // Process message with AI
    const aiResponse = await AIService.processNaturalLanguageQuery(message, context);
    
    // Add AI response to history
    history.push({
      role: 'assistant',
      content: aiResponse.response,
      timestamp: new Date(),
      intent: aiResponse.intent,
      confidence: aiResponse.confidence
    });

    // Store updated history (limit to last 50 messages)
    conversationHistory.set(convId, history.slice(-50));

    // Emit real-time response if socket is available
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('chatbot_response', {
        conversationId: convId,
        message: aiResponse.response,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence
      });
    }

    res.json({
      success: true,
      data: {
        conversationId: convId,
        response: aiResponse.response,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        suggestions: generateSuggestions(aiResponse.intent, context),
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Chatbot message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing message'
    });
  }
});

// @route   GET /api/chatbot/conversation/:conversationId
// @desc    Get conversation history
// @access  Private
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();
    
    // Verify user owns this conversation
    if (!conversationId.startsWith(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const history = conversationHistory.get(conversationId) || [];

    res.json({
      success: true,
      data: {
        conversationId,
        messages: history,
        messageCount: history.length
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversation'
    });
  }
});

// @route   DELETE /api/chatbot/conversation/:conversationId
// @desc    Clear conversation history
// @access  Private
router.delete('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();
    
    // Verify user owns this conversation
    if (!conversationId.startsWith(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    conversationHistory.delete(conversationId);

    res.json({
      success: true,
      message: 'Conversation cleared successfully'
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing conversation'
    });
  }
});

// @route   GET /api/chatbot/suggestions
// @desc    Get suggested questions/actions
// @access  Private
router.get('/suggestions', async (req, res) => {
  try {
    const userRole = req.user.role;
    const suggestions = getSuggestionsForRole(userRole);

    res.json({
      success: true,
      data: {
        suggestions,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving suggestions'
    });
  }
});

// @route   POST /api/chatbot/feedback
// @desc    Provide feedback on chatbot response
// @access  Private
router.post('/feedback', [
  body('conversationId').notEmpty().withMessage('Conversation ID is required'),
  body('messageIndex').isInt({ min: 0 }).withMessage('Valid message index is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { conversationId, messageIndex, rating, feedback } = req.body;
    const userId = req.user._id.toString();
    
    // Verify user owns this conversation
    if (!conversationId.startsWith(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const history = conversationHistory.get(conversationId);
    if (!history || !history[messageIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Add feedback to message
    history[messageIndex].feedback = {
      rating,
      comment: feedback,
      timestamp: new Date(),
      userId
    };

    // Update conversation history
    conversationHistory.set(conversationId, history);

    // Log feedback for analysis (in production, store in database)
    console.log('Chatbot feedback:', {
      conversationId,
      messageIndex,
      rating,
      feedback,
      userId,
      intent: history[messageIndex].intent
    });

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Chatbot feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording feedback'
    });
  }
});

// @route   GET /api/chatbot/analytics
// @desc    Get chatbot usage analytics
// @access  Private (Admin/HR)
router.get('/analytics', async (req, res) => {
  try {
    // Check if user has permission to view analytics
    if (!req.user.hasPermission('view_analytics')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const analytics = generateChatbotAnalytics();

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Chatbot analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving analytics'
    });
  }
});

// @route   POST /api/chatbot/train
// @desc    Train chatbot with new data
// @access  Private (Admin)
router.post('/train', [
  body('trainingData').isArray().withMessage('Training data must be an array'),
  body('trainingData.*.input').notEmpty().withMessage('Input is required for training data'),
  body('trainingData.*.output').notEmpty().withMessage('Output is required for training data'),
  body('trainingData.*.intent').notEmpty().withMessage('Intent is required for training data')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { trainingData } = req.body;

    // In production, implement actual model training
    console.log('Training chatbot with new data:', trainingData.length, 'samples');

    res.json({
      success: true,
      message: 'Chatbot training initiated',
      data: {
        samplesCount: trainingData.length,
        status: 'training_queued'
      }
    });
  } catch (error) {
    console.error('Chatbot training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating training'
    });
  }
});

// Helper functions
function generateSuggestions(intent, context) {
  const baseSuggestions = [
    "How do I request leave?",
    "What are my benefits?",
    "How can I update my profile?",
    "What training programs are available?"
  ];

  const roleSuggestions = {
    employee: [
      "Check my performance review",
      "View my pay stub",
      "Submit a timesheet",
      "Find company policies"
    ],
    manager: [
      "How do I approve leave requests?",
      "View team performance",
      "Schedule team meetings",
      "Access recruitment tools"
    ],
    hr: [
      "Generate employee reports",
      "Manage job postings",
      "Review applications",
      "Access AI insights"
    ],
    admin: [
      "System health check",
      "User management",
      "Analytics dashboard",
      "AI model status"
    ]
  };

  const intentSuggestions = {
    leave_request: [
      "How many leave days do I have left?",
      "What's the leave approval process?",
      "Can I cancel a leave request?"
    ],
    performance_inquiry: [
      "When is my next review?",
      "How are performance ratings calculated?",
      "What are my development goals?"
    ],
    policy_question: [
      "What's the remote work policy?",
      "What are the working hours?",
      "What's the dress code?"
    ]
  };

  let suggestions = [...baseSuggestions];
  
  if (context.user.role && roleSuggestions[context.user.role]) {
    suggestions = [...suggestions, ...roleSuggestions[context.user.role]];
  }
  
  if (intent.category && intentSuggestions[intent.category]) {
    suggestions = [...suggestions, ...intentSuggestions[intent.category]];
  }

  return suggestions.slice(0, 6); // Return top 6 suggestions
}

function getSuggestionsForRole(role) {
  const suggestions = {
    employee: [
      { text: "How do I request leave?", category: "leave" },
      { text: "Check my performance review", category: "performance" },
      { text: "What training is available?", category: "training" },
      { text: "Update my profile information", category: "profile" },
      { text: "View my benefits", category: "benefits" },
      { text: "Submit a support ticket", category: "support" }
    ],
    manager: [
      { text: "How do I approve leave requests?", category: "leave" },
      { text: "View my team's performance", category: "performance" },
      { text: "Schedule team meetings", category: "meetings" },
      { text: "Access recruitment tools", category: "recruitment" },
      { text: "Generate team reports", category: "reports" },
      { text: "Manage team training", category: "training" }
    ],
    hr: [
      { text: "Screen job applications", category: "recruitment" },
      { text: "Generate employee reports", category: "reports" },
      { text: "Manage job postings", category: "recruitment" },
      { text: "Access AI insights", category: "ai" },
      { text: "Review performance data", category: "performance" },
      { text: "Manage employee benefits", category: "benefits" }
    ],
    admin: [
      { text: "Check system health", category: "system" },
      { text: "Manage user accounts", category: "users" },
      { text: "View analytics dashboard", category: "analytics" },
      { text: "Configure AI models", category: "ai" },
      { text: "System backup status", category: "system" },
      { text: "Security audit logs", category: "security" }
    ]
  };

  return suggestions[role] || suggestions.employee;
}

function generateChatbotAnalytics() {
  const totalConversations = conversationHistory.size;
  let totalMessages = 0;
  let totalFeedback = 0;
  let averageRating = 0;
  const intentCounts = {};
  const userActivity = {};

  conversationHistory.forEach((history, conversationId) => {
    totalMessages += history.length;
    
    history.forEach(message => {
      if (message.role === 'assistant' && message.intent) {
        intentCounts[message.intent.category] = (intentCounts[message.intent.category] || 0) + 1;
      }
      
      if (message.feedback) {
        totalFeedback++;
        averageRating += message.feedback.rating;
      }
    });

    const userId = conversationId.split('_')[0];
    userActivity[userId] = (userActivity[userId] || 0) + 1;
  });

  averageRating = totalFeedback > 0 ? averageRating / totalFeedback : 0;

  return {
    overview: {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation: totalConversations > 0 ? totalMessages / totalConversations : 0,
      totalFeedback,
      averageRating: Math.round(averageRating * 100) / 100
    },
    intents: intentCounts,
    topUsers: Object.entries(userActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, conversationCount: count })),
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    }
  };
}

module.exports = router;