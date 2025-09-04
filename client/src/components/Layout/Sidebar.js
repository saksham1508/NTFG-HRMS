import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
  BeachAccess as BeachAccessIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  BusinessCenter,
  Assignment,
  TrendingUp,
  CalendarToday,
  MenuBook,
  SmartToy,
  Analytics,
  AdminPanelSettings,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState({});

  const handleItemClick = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  const handleExpandClick = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      permission: null, // Available to all
    },
    {
      title: 'Employees',
      icon: <PeopleIcon />,
      path: '/employees',
      permission: 'view_employees',
    },
    {
      title: 'Recruitment',
      icon: <WorkIcon />,
      path: '/recruitment',
      permission: 'view_recruitment',
      badge: 'New',
      subItems: [
        {
          title: 'Job Postings',
          icon: <BusinessCenter />,
          path: '/recruitment/jobs',
          permission: 'view_recruitment',
        },
        {
          title: 'Applications',
          icon: <Assignment />,
          path: '/recruitment/applications',
          permission: 'view_recruitment',
        },
        {
          title: 'Interview Schedule',
          icon: <CalendarToday />,
          path: '/recruitment/interviews',
          permission: 'view_recruitment',
        },
      ],
    },
    {
      title: 'Performance',
      icon: <AssessmentIcon />,
      path: '/performance',
      permission: 'view_performance',
      subItems: [
        {
          title: 'Reviews',
          icon: <TrendingUp />,
          path: '/performance/reviews',
          permission: 'view_performance',
        },
        {
          title: 'Goals',
          icon: <Assignment />,
          path: '/performance/goals',
          permission: 'view_performance',
        },
        {
          title: 'Analytics',
          icon: <Analytics />,
          path: '/performance/analytics',
          permission: 'view_analytics',
        },
      ],
    },
    {
      title: 'Leave Management',
      icon: <BeachAccessIcon />,
      path: '/leave',
      permission: 'view_leave',
      subItems: [
        {
          title: 'My Requests',
          icon: <CalendarToday />,
          path: '/leave/my-requests',
          permission: null,
        },
        {
          title: 'Team Requests',
          icon: <Assignment />,
          path: '/leave/team-requests',
          permission: 'approve_leave',
        },
        {
          title: 'Leave Calendar',
          icon: <CalendarToday />,
          path: '/leave/calendar',
          permission: 'view_leave',
        },
      ],
    },
    {
      title: 'Training & Development',
      icon: <SchoolIcon />,
      path: '/training',
      permission: 'view_training',
      subItems: [
        {
          title: 'Programs',
          icon: <MenuBook />,
          path: '/training/programs',
          permission: 'view_training',
        },
        {
          title: 'My Learning',
          icon: <SchoolIcon />,
          path: '/training/my-learning',
          permission: null,
        },
        {
          title: 'Certifications',
          icon: <Assignment />,
          path: '/training/certifications',
          permission: 'view_training',
        },
      ],
    },
    {
      title: 'AI Insights',
      icon: <PsychologyIcon />,
      path: '/ai-insights',
      permission: 'use_ai_features',
      badge: 'AI',
      badgeColor: 'secondary',
      subItems: [
        {
          title: 'Resume Screening',
          icon: <SmartToy />,
          path: '/ai-insights/resume-screening',
          permission: 'use_ai_features',
        },
        {
          title: 'Performance Prediction',
          icon: <TrendingUp />,
          path: '/ai-insights/performance-prediction',
          permission: 'use_ai_features',
        },
        {
          title: 'Skill Gap Analysis',
          icon: <Analytics />,
          path: '/ai-insights/skill-gaps',
          permission: 'use_ai_features',
        },
        {
          title: 'Chatbot Analytics',
          icon: <SmartToy />,
          path: '/ai-insights/chatbot-analytics',
          permission: 'view_analytics',
        },
      ],
    },
  ];

  const bottomMenuItems = [
    {
      title: 'My Profile',
      icon: <PersonIcon />,
      path: '/profile',
      permission: null,
    },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      permission: 'manage_system',
    },
  ];

  const renderMenuItem = (item, isSubItem = false) => {
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems[item.title];
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => {
              if (hasSubItems) {
                handleExpandClick(item.title);
              } else {
                handleItemClick(item.path);
              }
            }}
            sx={{
              minHeight: 48,
              justifyContent: 'initial',
              px: isSubItem ? 4 : 2.5,
              py: 1,
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
                color: active ? 'white' : 'rgba(255, 255, 255, 0.8)',
                fontSize: isSubItem ? '1.2rem' : '1.5rem',
              }}
            >
              {item.icon}
            </ListItemIcon>
            
            <ListItemText
              primary={item.title}
              sx={{
                opacity: 1,
                '& .MuiListItemText-primary': {
                  fontSize: isSubItem ? '0.875rem' : '1rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'white' : 'rgba(255, 255, 255, 0.9)',
                },
              }}
            />

            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                color={item.badgeColor || 'primary'}
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  mr: hasSubItems ? 1 : 0,
                }}
              />
            )}

            {hasSubItems && (
              <Box sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </Box>
            )}
          </ListItemButton>
        </ListItem>

        {hasSubItems && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem) => renderMenuItem(subItem, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Company Name */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'white',
            mb: 0.5,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          🚀 NTFG HRMS
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          AI-Powered HR Management
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mx: 2 }} />

      {/* User Info */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: 'white',
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {user?.profile?.firstName} {user?.profile?.lastName}
        </Typography>
        <Chip
          label={user?.role?.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 600,
          }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mx: 2, mb: 1 }} />

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Bottom Navigation */}
      <Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mx: 2, mb: 1 }} />
        <List>
          {bottomMenuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.7rem',
          }}
        >
          © 2024 NextTechFusionGadgets
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;