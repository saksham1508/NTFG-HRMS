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
  BeachAccess as BeachAccessIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const Leave = () => {
  return (
    <>
      <Helmet>
        <title>Leave Management - NTFG HRMS</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 48, height: 48 }}>
              <BeachAccessIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Leave Management
                <Chip label="Coming Soon" size="small" color="warning" sx={{ ml: 2 }} />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Smart leave tracking and approval workflows
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>🏖️</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Leave Management System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Intelligent leave management with automated approvals coming soon...
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Leave;