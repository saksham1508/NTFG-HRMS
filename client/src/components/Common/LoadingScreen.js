import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading...', showProgress = false, progress = 0 }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        color: 'white',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ marginBottom: '2rem' }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: '4rem',
              mb: 2,
            }}
          >
            🚀
          </Typography>
        </motion.div>

        {/* Company Name */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          NTFG HRMS
        </Typography>

        {/* Tagline */}
        <Typography
          variant="h6"
          sx={{
            mb: 4,
            opacity: 0.9,
            fontWeight: 400,
          }}
        >
          AI-Powered Human Resource Management
        </Typography>

        {/* Loading Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: 'white',
              mb: 3,
            }}
          />
        </motion.div>

        {/* Loading Message */}
        <Typography
          variant="body1"
          sx={{
            mb: showProgress ? 2 : 0,
            opacity: 0.8,
            fontSize: '1.1rem',
          }}
        >
          {message}
        </Typography>

        {/* Progress Bar */}
        {showProgress && (
          <Box sx={{ width: 300, mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white',
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                mt: 1,
                opacity: 0.8,
              }}
            >
              {Math.round(progress)}%
            </Typography>
          </Box>
        )}

        {/* Loading Dots Animation */}
        <motion.div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '1rem',
          }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'white',
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            opacity: 0.7,
            fontSize: '0.9rem',
          }}
        >
          © 2024 NextTechFusionGadgets. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;