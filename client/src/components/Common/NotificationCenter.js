import React from 'react';
import {

  Alert,
  AlertTitle,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import { useSocket } from '../../contexts/SocketContext';

const NotificationCenter = () => {
  const { notifications, removeNotification } = useSocket();

  // Show only the most recent 3 notifications as toasts
  const activeNotifications = notifications
    .filter(notification => !notification.dismissed)
    .slice(0, 3);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const handleClose = (notificationId) => {
    removeNotification(notificationId);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 24,
        zIndex: 2000,
        maxWidth: 400,
        width: '100%',
      }}
    >
      <AnimatePresence>
        {activeNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            style={{
              marginBottom: '12px',
            }}
          >
            <Alert
              severity={getSeverity(notification.type)}
              icon={getIcon(notification.type)}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => handleClose(notification.id)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              {notification.title && (
                <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
                  {notification.title}
                </AlertTitle>
              )}
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                {notification.message}
              </Typography>

              {notification.timestamp && (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    fontSize: '0.75rem',
                  }}
                >
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </Typography>
              )}

              {notification.actions && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  {notification.actions.map((action, actionIndex) => (
                    <motion.button
                      key={actionIndex}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={action.onClick}
                      style={{
                        background: 'transparent',
                        border: '1px solid currentColor',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        color: 'inherit',
                      }}
                    >
                      {action.label}
                    </motion.button>
                  ))}
                </Box>
              )}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default NotificationCenter;