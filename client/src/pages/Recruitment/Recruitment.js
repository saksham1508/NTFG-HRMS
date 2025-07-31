import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Work as WorkIcon,
  Add as AddIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const Recruitment = () => {
  return (
    <>
      <Helmet>
        <title>Recruitment - NTFG HRMS</title>
        <meta name="description" content="AI-powered recruitment and hiring management" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              <WorkIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Recruitment Suite
                <Chip
                  label="AI-Powered"
                  size="small"
                  color="secondary"
                  sx={{ ml: 2, fontWeight: 600 }}
                />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Streamline your hiring process with intelligent automation
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Post New Job
            </Button>
            <Button variant="outlined" startIcon={<PsychologyIcon />}>
              AI Screening
            </Button>
            <Button variant="outlined" startIcon={<TrendingUpIcon />}>
              Analytics
            </Button>
          </Box>
        </Box>

        {/* Feature Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'Smart Job Posting',
              description: 'AI-optimized job descriptions that attract the right candidates',
              icon: '📝',
              color: '#667eea',
            },
            {
              title: 'Resume Screening',
              description: 'Automated candidate screening with 95% accuracy',
              icon: '🤖',
              color: '#764ba2',
            },
            {
              title: 'Interview Scheduling',
              description: 'Intelligent scheduling with calendar integration',
              icon: '📅',
              color: '#f093fb',
            },
            {
              title: 'Candidate Analytics',
              description: 'Deep insights into your recruitment pipeline',
              icon: '📊',
              color: '#4facfe',
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography
                      variant="h3"
                      sx={{ mb: 2, fontSize: '3rem' }}
                    >
                      {feature.icon}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1, color: feature.color }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.5 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Coming Soon Card */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Avatar
              sx={{
                bgcolor: 'secondary.light',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                fontSize: '2rem',
              }}
            >
              🚀
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Advanced Recruitment Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              Our AI-powered recruitment suite is being fine-tuned to revolutionize your hiring process. 
              Experience the future of talent acquisition with machine learning algorithms that learn 
              from your hiring patterns and continuously improve candidate matching.
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🎯 Key Features in Development
              </Typography>
              <Grid container spacing={2} sx={{ maxWidth: 800, mx: 'auto' }}>
                {[
                  'AI Resume Parsing & Scoring',
                  'Predictive Candidate Matching',
                  'Automated Interview Scheduling',
                  'Bias-Free Screening Algorithms',
                  'Real-time Recruitment Analytics',
                  'Candidate Experience Optimization',
                  'Integration with 50+ Job Boards',
                  'Video Interview AI Analysis',
                ].map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'secondary.main',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {feature}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Request Early Access
              </Button>
              <Button variant="outlined" size="large">
                View Demo
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Recruitment;