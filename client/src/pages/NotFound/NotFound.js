import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Page Not Found - NTFG HRMS</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            py: 4,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 404 Illustration */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', md: '8rem' },
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              404
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: 'text.primary',
              }}
            >
              Oops! Page Not Found
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 4,
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, our AI assistant can help you find what you need!
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                Go to Dashboard
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    backgroundColor: 'rgba(102, 126, 234, 0.04)',
                  },
                }}
              >
                Go Back
              </Button>
            </Box>

            {/* Helpful Links */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Or try these popular pages:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/employees')}
                  sx={{ textTransform: 'none' }}
                >
                  Employees
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/recruitment')}
                  sx={{ textTransform: 'none' }}
                >
                  Recruitment
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/ai-insights')}
                  sx={{ textTransform: 'none' }}
                >
                  AI Insights
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/profile')}
                  sx={{ textTransform: 'none' }}
                >
                  My Profile
                </Button>
              </Box>
            </Box>
          </motion.div>

          {/* Animated Background Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              zIndex: -1,
            }}
          >
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + index,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
                style={{
                  position: 'absolute',
                  width: 60 + index * 20,
                  height: 60 + index * 20,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${
                    index % 2 === 0 ? '#667eea' : '#764ba2'
                  } 0%, ${index % 2 === 0 ? '#764ba2' : '#667eea'} 100%)`,
                  opacity: 0.1,
                  left: `${10 + index * 15}%`,
                  top: `${20 + index * 10}%`,
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default NotFound;