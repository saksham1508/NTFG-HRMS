import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Chip,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { chatbotAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const ChatBot = ({ open, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState({ open: false, messageIndex: null });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get suggestions
  const { data: suggestionsData } = useQuery(
    'chatbot-suggestions',
    chatbotAPI.getSuggestions,
    {
      enabled: open,
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(chatbotAPI.sendMessage, {
    onSuccess: (data) => {
      const aiMessage = {
        id: Date.now(),
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
        intent: data.data.intent,
        confidence: data.data.confidence,
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationId(data.data.conversationId);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Send message error:', error);
      setIsTyping(false);
      
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  // Provide feedback mutation
  const feedbackMutation = useMutation(chatbotAPI.provideFeedback, {
    onSuccess: () => {
      setFeedbackDialog({ open: false, messageIndex: null });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Listen for real-time responses
  useEffect(() => {
    if (socket) {
      socket.on('chatbot_response', (response) => {
        const aiMessage = {
          id: Date.now(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          intent: response.intent,
          confidence: response.confidence,
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      });

      return () => {
        socket.off('chatbot_response');
      };
    }
  }, [socket]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      await sendMessageMutation.mutateAsync({
        message: message.trim(),
        conversationId,
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion.text);
    inputRef.current?.focus();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (messageIndex, rating, comment = '') => {
    if (!conversationId) return;

    feedbackMutation.mutate({
      conversationId,
      messageIndex,
      rating,
      feedback: comment,
    });
  };

  const handleClearConversation = () => {
    setMessages([]);
    setConversationId(null);
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `Hello ${user?.profile?.firstName}! I'm your AI HR assistant. How can I help you today?`,
      timestamp: new Date(),
      isWelcome: true,
    };
    
    setMessages([welcomeMessage]);
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    const isError = msg.isError;

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: '16px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            maxWidth: '80%',
            flexDirection: isUser ? 'row-reverse' : 'row',
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              mx: 1,
              bgcolor: isUser ? 'primary.main' : isError ? 'error.main' : 'secondary.main',
            }}
          >
            {isUser ? <PersonIcon /> : <SmartToyIcon />}
          </Avatar>

          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: isUser 
                ? 'primary.main' 
                : isError 
                ? 'error.light' 
                : 'grey.100',
              color: isUser || isError ? 'white' : 'text.primary',
              borderBottomRightRadius: isUser ? 4 : 16,
              borderBottomLeftRadius: isUser ? 16 : 4,
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                opacity: 0.7,
                fontSize: '0.7rem',
              }}
            >
              {msg.timestamp.toLocaleTimeString()}
            </Typography>

            {!isUser && !isError && !msg.isWelcome && (
              <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setFeedbackDialog({ open: true, messageIndex: index })}
                  sx={{ color: 'inherit', opacity: 0.7 }}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleFeedback(index, 1)}
                  sx={{ color: 'inherit', opacity: 0.7 }}
                >
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {msg.intent && (
              <Chip
                label={`${msg.intent.category} (${Math.round(msg.confidence * 100)}%)`}
                size="small"
                sx={{ mt: 1, fontSize: '0.7rem' }}
              />
            )}
          </Paper>
        </Box>
      </motion.div>
    );
  };

  // Initialize with welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `Hello ${user?.profile?.firstName}! I'm your AI HR assistant. How can I help you today?`,
        timestamp: new Date(),
        isWelcome: true,
      };
      
      setMessages([welcomeMessage]);
    }
  }, [open, user, messages.length]);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
              <SmartToyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                AI Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Always here to help
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <IconButton
              onClick={handleClearConversation}
              sx={{ color: 'white', mr: 1 }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: 'auto',
            backgroundColor: '#f5f5f5',
          }}
        >
          <AnimatePresence>
            {messages.map((msg, index) => renderMessage(msg, index))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '16px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
                  <SmartToyIcon />
                </Avatar>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#667eea',
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Suggestions */}
        {suggestionsData?.data?.suggestions && messages.length <= 1 && (
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Quick Actions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestionsData.data.suggestions.slice(0, 4).map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion.text}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Input */}
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              ref={inputRef}
              fullWidth
              multiline
              maxRows={3}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isLoading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                },
              }}
            >
              {sendMessageMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </Box>
      </Drawer>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialog.open}
        onClose={() => setFeedbackDialog({ open: false, messageIndex: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rate this response</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            How helpful was this response?
          </Typography>
          <Rating
            size="large"
            onChange={(event, value) => {
              if (value) {
                handleFeedback(feedbackDialog.messageIndex, value);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog({ open: false, messageIndex: null })}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatBot;