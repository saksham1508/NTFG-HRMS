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
  School as SchoolIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const Training = () => {
  return (
    <>
      <Helmet>
        <title>Training & Development - NTFG HRMS</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 48, height: 48 }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Training & Development
                <Chip label="Coming Soon" size="small" color="warning" sx={{ ml: 2 }} />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-powered learning paths and skill development
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>🎓</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Training & Development Platform
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Personalized learning experiences with AI recommendations coming soon...
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Training;