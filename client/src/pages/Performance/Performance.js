import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const Performance = () => {
  return (
    <>
      <Helmet>
        <title>Performance Management - NTFG HRMS</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 48, height: 48 }}>
              <AssessmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Performance Management
                <Chip label="Coming Soon" size="small" color="warning" sx={{ ml: 2 }} />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-driven performance analytics and goal tracking
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>📈</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Performance Management Module
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Advanced performance tracking with AI insights coming soon...
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Performance;