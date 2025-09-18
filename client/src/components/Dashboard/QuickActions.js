import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
  BeachAccess as BeachAccessIcon,
  Psychology as PsychologyIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuickActions = ({ userRole }) => {
  const navigate = useNavigate();

  const getQuickActions = () => {
    const commonActions = [
      {
        title: 'My Profile',
        description: 'Update personal information',
        icon: <PeopleIcon />,
        color: '#667eea',
        path: '/profile',
      },
      {
        title: 'Request Leave',
        description: 'Submit a leave request',
        icon: <BeachAccessIcon />,
        color: '#4facfe',
        path: '/leave/request',
      },
    ];

    switch (userRole) {
      case 'admin':
      case 'hr':
        return [
          {
            title: 'Add Employee',
            description: 'Register new employee',
            icon: <AddIcon />,
            color: '#667eea',
            path: '/employees/',
          },
          {
            title: 'Post Job',
            description: 'Create job posting',
            icon: <WorkIcon />,
            color: '#764ba2',
            path: '/recruitment/jobs/add',
          },
          {
            title: 'AI Screening',
            description: 'Screen applications with AI',
            icon: <PsychologyIcon />,
            color: '#f093fb',
            path: '/ai-insights/resume-screening',
          },
          {
            title: 'View Applications',
            description: 'Review job applications',
            icon: <AssignmentIcon />,
            color: '#4facfe',
            path: '/recruitment/applications',
          },
          ...commonActions,
        ];

      case 'manager':
        return [
          {
            title: 'Team Performance',
            description: 'Review team metrics',
            icon: <TrendingUpIcon />,
            color: '#667eea',
            path: '/performance/team',
          },
          {
            title: 'Approve Leaves',
            description: 'Review leave requests',
            icon: <AssessmentIcon />,
            color: '#764ba2',
            path: '/leave/team-requests',
          },
          {
            title: 'Schedule Review',
            description: 'Performance reviews',
            icon: <AssignmentIcon />,
            color: '#f093fb',
            path: '/performance/reviews/schedule',
          },
          {
            title: 'Team Training',
            description: 'Assign training programs',
            icon: <SchoolIcon />,
            color: '#4facfe',
            path: '/training/assign',
          },
          ...commonActions,
        ];

      case 'employee':
      default:
        return [
          {
            title: 'My Performance',
            description: 'View performance data',
            icon: <TrendingUpIcon />,
            color: '#667eea',
            path: '/performance',
          },
          {
            title: 'Training Programs',
            description: 'Browse available courses',
            icon: <SchoolIcon />,
            color: '#764ba2',
            path: '/training/programs',
          },
          {
            title: 'My Goals',
            description: 'Track personal goals',
            icon: <AssignmentIcon />,
            color: '#f093fb',
            path: '/performance/my-goals',
          },
          ...commonActions,
        ];
    }
  };

  const actions = getQuickActions();

  const handleActionClick = (path) => {
    navigate(path);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  fullWidth
                  onClick={() => handleActionClick(action.path)}
                  sx={{
                    p: 2,
                    height: 'auto',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: action.color,
                      backgroundColor: `${action.color}08`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Avatar
                      sx={{
                        bgcolor: action.color,
                        width: 36,
                        height: 36,
                        mr: 1.5,
                      }}
                    >
                      {action.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          color: 'text.primary',
                          lineHeight: 1.2,
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.3,
                          display: 'block',
                        }}
                      >
                        {action.description}
                      </Typography>
                    </Box>
                  </Box>
                </Button>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* AI Assistant Promotion */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 48,
              height: 48,
              mx: 'auto',
              mb: 1,
              fontSize: '1.5rem',
            }}
          >
            🤖
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Need Help?
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
            Ask our AI assistant anything about HR processes, policies, or your account.
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
              },
            }}
            onClick={() => {
              // This would trigger the chatbot to open
              // The chatbot is controlled by the Layout component
              const event = new CustomEvent('openChatbot');
              window.dispatchEvent(event);
            }}
          >
            Chat with AI
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActions;