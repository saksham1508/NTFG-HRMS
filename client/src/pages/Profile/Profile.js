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
  Person as PersonIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const Profile = () => {
  return (
    <>
      <Helmet>
        <title>My Profile - NTFG HRMS</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                My Profile
                <Chip label="Coming Soon" size="small" color="warning" sx={{ ml: 2 }} />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your personal information and preferences
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>👤</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Profile Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive profile management with AI-powered insights coming soon...
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Profile;