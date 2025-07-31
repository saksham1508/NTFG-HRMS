import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const Employees = () => {
  return (
    <>
      <Helmet>
        <title>Employees - NTFG HRMS</title>
        <meta name="description" content="Manage employees with AI-powered insights" />
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
                bgcolor: 'primary.main',
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Employee Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your workforce with AI-powered insights
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
              Add Employee
            </Button>
            <Button variant="outlined" startIcon={<SearchIcon />}>
              Search
            </Button>
            <Button variant="outlined" startIcon={<FilterIcon />}>
              Filter
            </Button>
          </Box>
        </Box>

        {/* Coming Soon Card */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.light',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                fontSize: '2rem',
              }}
            >
              🚧
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Employee Management Module
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              This comprehensive employee management system is currently under development. 
              It will include advanced features like AI-powered performance analytics, 
              automated onboarding workflows, and intelligent skill gap analysis.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Expected features:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
              {[
                'Employee Directory with Advanced Search',
                'AI-Powered Performance Insights',
                'Automated Onboarding Workflows',
                'Skill Gap Analysis & Recommendations',
                'Real-time Employee Analytics',
                'Smart Organizational Charts',
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
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
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Employees;