import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,

  Chip,
  Skeleton,
  Button,
  Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format, isToday, isTomorrow } from 'date-fns';

const UpcomingEvents = ({ events = [], loading = false }) => {
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'interview':
        return '#667eea';
      case 'meeting':
        return '#764ba2';
      case 'training':
        return '#4facfe';
      case 'deadline':
        return '#f5576c';
      default:
        return '#667eea';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'interview':
        return '👥';
      case 'meeting':
        return '📅';
      case 'training':
        return '🎓';
      case 'deadline':
        return '⏰';
      default:
        return '📅';
    }
  };

  const formatEventDate = (date) => {
    const eventDate = new Date(date);
    
    if (isToday(eventDate)) {
      return `Today, ${format(eventDate, 'h:mm a')}`;
    }
    
    if (isTomorrow(eventDate)) {
      return `Tomorrow, ${format(eventDate, 'h:mm a')}`;
    }
    
    return format(eventDate, 'MMM d, h:mm a');
  };

  const getUrgencyChip = (date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffHours = (eventDate - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return { label: 'Soon', color: 'error' };
    } else if (diffHours < 24) {
      return { label: 'Today', color: 'warning' };
    } else if (diffHours < 48) {
      return { label: 'Tomorrow', color: 'info' };
    }
    
    return null;
  };

  if (loading) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Upcoming Events
          </Typography>
          <List sx={{ p: 0 }}>
            {[1, 2, 3].map((item) => (
              <ListItem key={item} sx={{ px: 0, py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Upcoming Events
          </Typography>
          <Button
            size="small"
            endIcon={<VisibilityIcon />}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>

        {events.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <CalendarIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">No upcoming events</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {events.slice(0, 5).map((event, index) => {
              const urgencyChip = getUrgencyChip(event.date);
              
              return (
                <ListItem
                  key={event.id}
                  sx={{
                    px: 0,
                    py: 1.5,
                    borderBottom: index < Math.min(events.length, 5) - 1 ? '1px solid #f0f0f0' : 'none',
                    cursor: 'pointer',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Avatar
                      sx={{
                        bgcolor: getEventTypeColor(event.type),
                        width: 40,
                        height: 40,
                        mr: 2,
                        fontSize: '1.2rem',
                      }}
                    >
                      {getEventTypeIcon(event.type)}
                    </Avatar>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            flexGrow: 1,
                            lineHeight: 1.3,
                          }}
                        >
                          {event.title}
                        </Typography>
                        {urgencyChip && (
                          <Chip
                            label={urgencyChip.label}
                            size="small"
                            color={urgencyChip.color}
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              ml: 1,
                            }}
                          />
                        )}
                      </Box>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {event.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {formatEventDate(event.date)}
                          </Typography>
                        </Box>
                        
                        {event.duration > 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            • {event.duration}min
                          </Typography>
                        )}
                        
                        {event.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.75rem',
                                maxWidth: 120,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {event.location}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}

        {events.length > 5 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="text"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              View {events.length - 5} more events
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;