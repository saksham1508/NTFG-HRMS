import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Button,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  SmartToy as SmartToyIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const AIInsights = () => {
  const aiFeatures = [
    {
      title: 'Resume Screening',
      description: 'AI-powered candidate evaluation with 95% accuracy',
      icon: '🤖',
      color: '#667eea',
      status: 'Active',
    },
    {
      title: 'Performance Prediction',
      description: 'Predict employee performance using machine learning',
      icon: '📊',
      color: '#764ba2',
      status: 'Beta',
    },
    {
      title: 'Skill Gap Analysis',
      description: 'Identify training needs with intelligent analysis',
      icon: '🎯',
      color: '#f093fb',
      status: 'Coming Soon',
    },
    {
      title: 'Sentiment Analysis',
      description: 'Analyze employee feedback and satisfaction',
      icon: '💭',
      color: '#4facfe',
      status: 'Coming Soon',
    },
  ];

  return (
    <>
      <Helmet>
        <title>AI Insights - NTFG HRMS</title>
        <meta name="description" content="AI-powered HR insights and analytics" />
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
              <PsychologyIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                AI Insights Dashboard
                <Chip
                  label="Powered by AI"
                  size="small"
                  color="secondary"
                  sx={{ ml: 2, fontWeight: 600 }}
                />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Harness the power of artificial intelligence for smarter HR decisions
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<SmartToyIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Train Models
            </Button>
            <Button variant="outlined" startIcon={<AnalyticsIcon />}>
              View Analytics
            </Button>
            <Button variant="outlined" startIcon={<TrendingUpIcon />}>
              Performance Metrics
            </Button>
          </Box>
        </Box>

        {/* AI Features Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {aiFeatures.map((feature, index) => (
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
                      sx={{ mb: 2, lineHeight: 1.5 }}
                    >
                      {feature.description}
                    </Typography>
                    <Chip
                      label={feature.status}
                      size="small"
                      color={
                        feature.status === 'Active' ? 'success' :
                        feature.status === 'Beta' ? 'warning' : 'default'
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
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
              🧠
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Advanced AI Analytics Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              Our cutting-edge AI platform is being trained on millions of HR data points to provide 
              unprecedented insights into your workforce. Experience the future of human resource 
              management with predictive analytics and intelligent automation.
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🚀 AI Capabilities
              </Typography>
              <Grid container spacing={2} sx={{ maxWidth: 800, mx: 'auto' }}>
                {[
                  'Natural Language Processing for Resume Analysis',
                  'Machine Learning Performance Predictions',
                  'Computer Vision for Video Interview Analysis',
                  'Predictive Analytics for Turnover Risk',
                  'Automated Bias Detection in Hiring',
                  'Intelligent Skill Matching Algorithms',
                  'Real-time Sentiment Analysis',
                  'Personalized Career Path Recommendations',
                ].map((capability, index) => (
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
                        {capability}
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
                startIcon={<SmartToyIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Explore AI Features
              </Button>
              <Button variant="outlined" size="large">
                Schedule Demo
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AIInsights;