import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from '../../components/Dashboard/StatsCard';
import ChartCard from '../../components/Dashboard/ChartCard';
import ActivityFeed from '../../components/Dashboard/ActivityFeed';
import UpcomingEvents from '../../components/Dashboard/UpcomingEvents';
import QuickActions from '../../components/Dashboard/QuickActions';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: overviewData, isLoading: overviewLoading } = useQuery(
    'dashboard-overview',
    dashboardAPI.getOverviewStats
  );

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery(
    'dashboard-activities',
    dashboardAPI.getRecentActivities
  );

  const { data: eventsData, isLoading: eventsLoading } = useQuery(
    'dashboard-events',
    dashboardAPI.getUpcomingEvents
  );

  const { data: metricsData, isLoading: metricsLoading } = useQuery(
    'dashboard-metrics',
    dashboardAPI.getPerformanceMetrics,
    {
      enabled: user?.permissions?.includes('view_analytics'),
    }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatsCards = () => {
    const stats = overviewData?.data;
    if (!stats) return [];

    const commonCards = [
      {
        title: 'Total Employees',
        value: stats.common?.totalEmployees || 0,
        icon: <PeopleIcon />,
        color: '#667eea',
        trend: { value: 5.2, isPositive: true },
      },
      {
        title: 'Active Jobs',
        value: stats.common?.activeJobPostings || 0,
        icon: <WorkIcon />,
        color: '#764ba2',
        trend: { value: 2.1, isPositive: true },
      },
    ];

    // Role-specific cards
    if (user?.role === 'admin' || user?.role === 'hr') {
      return [
        ...commonCards,
        {
          title: 'Pending Applications',
          value: stats.hr?.pendingApplications || 0,
          icon: <AssessmentIcon />,
          color: '#f39c12',
          trend: { value: 8.3, isPositive: false },
        },
        {
          title: 'Today\'s Applications',
          value: stats.hr?.todayApplications || 0,
          icon: <TrendingUpIcon />,
          color: '#27ae60',
          trend: { value: 12.5, isPositive: true },
        },
      ];
    }

    if (user?.role === 'manager') {
      return [
        ...commonCards,
        {
          title: 'Team Size',
          value: stats.manager?.teamSize || 0,
          icon: <PeopleIcon />,
          color: '#9b59b6',
          trend: { value: 0, isPositive: true },
        },
        {
          title: 'Team Applications',
          value: stats.manager?.teamApplications || 0,
          icon: <WorkIcon />,
          color: '#e74c3c',
          trend: { value: 3.2, isPositive: true },
        },
      ];
    }

    return commonCards;
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - NTFG HRMS</title>
        <meta name="description" content="HRMS Dashboard with AI-powered insights and analytics" />
      </Helmet>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <Paper
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {getGreeting()}, {user?.profile?.firstName}! 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  Welcome to your AI-powered HRMS dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  {user?.employment?.position} • {user?.employment?.department}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '2rem',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                  </Avatar>
                  <Chip
                    label={user?.role?.toUpperCase()}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {getStatsCards().map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatsCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  trend={stat.trend}
                  loading={overviewLoading}
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Charts Section */}
            {user?.permissions?.includes('view_analytics') && (
              <motion.div variants={itemVariants}>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <ChartCard
                      title="Employee Growth"
                      type="line"
                      data={metricsData?.data?.employeeGrowth || []}
                      loading={metricsLoading}
                      height={300}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ChartCard
                      title="Department Distribution"
                      type="doughnut"
                      data={metricsData?.data?.departmentStats || []}
                      loading={metricsLoading}
                      height={300}
                    />
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {/* Recent Activities */}
            <motion.div variants={itemVariants}>
              <ActivityFeed
                activities={activitiesData?.data?.activities || []}
                loading={activitiesLoading}
              />
            </motion.div>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <QuickActions userRole={user?.role} />
            </motion.div>

            {/* Upcoming Events */}
            <motion.div variants={itemVariants}>
              <UpcomingEvents
                events={eventsData?.data?.events || []}
                loading={eventsLoading}
              />
            </motion.div>

            {/* AI Insights Preview */}
            {user?.permissions?.includes('use_ai_features') && (
              <motion.div variants={itemVariants}>
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'secondary.main',
                          mr: 2,
                          width: 40,
                          height: 40,
                        }}
                      >
                        🤖
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        AI Insights
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Get AI-powered insights about your workforce
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Resume Screening Accuracy
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={87}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        87% accuracy this month
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      fullWidth
                      href="/ai-insights"
                      sx={{ mt: 1 }}
                    >
                      View All Insights
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* System Status */}
            <motion.div variants={itemVariants}>
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    System Status
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">All systems operational</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">AI services online</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">Scheduled maintenance: 2 AM</Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </>
  );
};

export default Dashboard;