import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
        transports: ['websocket', 'polling'],
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);
        
        // Join user-specific room
        newSocket.emit('join_room', `user_${user._id}`);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Real-time notifications
      newSocket.on('notification', (notification) => {
        console.log('📢 New notification:', notification);
        
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
        
        // Show toast notification
        toast(notification.message, {
          icon: getNotificationIcon(notification.type),
          duration: 5000,
        });
      });

      // Chatbot responses
      newSocket.on('chatbot_response', (response) => {
        console.log('🤖 Chatbot response:', response);
        // Handle chatbot response in chatbot component
      });

      // Real-time updates for various modules
      newSocket.on('employee_update', (data) => {
        console.log('👤 Employee update:', data);
        // Handle employee updates
      });

      newSocket.on('application_update', (data) => {
        console.log('📄 Application update:', data);
        // Handle application updates
      });

      newSocket.on('leave_request_update', (data) => {
        console.log('🏖️ Leave request update:', data);
        // Handle leave request updates
      });

      newSocket.on('performance_update', (data) => {
        console.log('📊 Performance update:', data);
        // Handle performance updates
      });

      newSocket.on('training_update', (data) => {
        console.log('🎓 Training update:', data);
        // Handle training updates
      });

      // System-wide announcements
      newSocket.on('system_announcement', (announcement) => {
        console.log('📢 System announcement:', announcement);
        
        toast(announcement.message, {
          icon: '📢',
          duration: 8000,
          style: {
            background: '#667eea',
            color: 'white',
          },
        });
      });

      // AI processing updates
      newSocket.on('ai_processing_complete', (data) => {
        console.log('🤖 AI processing complete:', data);
        
        toast.success(`AI processing completed: ${data.task}`);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        console.log('🔌 Cleaning up socket connection');
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Clean up socket if user is not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Helper function to get notification icon
  const getNotificationIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      message: '💬',
      reminder: '⏰',
      update: '🔄',
      approval: '✅',
      rejection: '❌',
      assignment: '📋',
      completion: '🎉',
    };
    return icons[type] || 'ℹ️';
  };

  // Socket utility functions
  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  };

  const joinRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('join_room', room);
    }
  };

  const leaveRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('leave_room', room);
    }
  };

  // Notification management
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Get unread notification count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const value = {
    socket,
    isConnected,
    notifications,
    
    // Socket utilities
    emitEvent,
    joinRoom,
    leaveRoom,
    
    // Notification management
    markNotificationAsRead,
    clearNotifications,
    removeNotification,
    getUnreadCount,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};