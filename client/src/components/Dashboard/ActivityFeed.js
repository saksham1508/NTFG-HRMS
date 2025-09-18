// import React from 'react';
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Avatar,
//   Chip,
//   Skeleton,
//   Button,
// } from '@mui/material';
// import {
//   Person as PersonIcon,
//   Work as WorkIcon,
//   Assignment as AssignmentIcon,
//   TrendingUp as TrendingUpIcon,
//   Visibility as VisibilityIcon,
// } from '@mui/icons-material';
// import { formatDistanceToNow } from 'date-fns';

// const ActivityFeed = ({ activities = [], loading = false }) => {
//   const getActivityIcon = (type) => {
//     switch (type) {
//       case 'employee':
//         return <PersonIcon />;
//       case 'job_posting':
//         return <WorkIcon />;
//       case 'application':
//         return <AssignmentIcon />;
//       case 'performance':
//         return <TrendingUpIcon />;
//       default:
//         return <AssignmentIcon />;
//     }
//   };

//   const getActivityColor = (type) => {
//     switch (type) {
//       case 'employee':
//         return '#667eea';
//       case 'job_posting':
//         return '#764ba2';
//       case 'application':
//         return '#f093fb';
//       case 'performance':
//         return '#4facfe';
//       default:
//         return '#667eea';
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active':  
//       case 'hired':
//       case 'approved':
//         return 'success';
//       case 'pending':
//       case 'under_review':
//         return 'warning';
//       case 'rejected':
//       case 'inactive':
//         return 'error';
//       default:
//         return 'default';
//     }
//   };

//   if (loading) {
//     return (
//       <Card>
//         <CardContent>
//           <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
//             Recent Activities
//           </Typography>
//           <List>
//             {[1, 2, 3, 4, 5].map((item) => (
//               <ListItem key={item} sx={{ px: 0 }}>
//                 <ListItemAvatar>
//                   <Skeleton variant="circular" width={40} height={40} />
//                 </ListItemAvatar>
//                 <ListItemText
//                   primary={<Skeleton variant="text" width="60%" height={20} />}
//                   secondary={<Skeleton variant="text" width="40%" height={16} />}
//                 />
//               </ListItem>
//             ))}
//           </List>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardContent>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//           <Typography variant="h6" sx={{ fontWeight: 600 }}>
//             Recent Activities
//           </Typography>
//           <Button
//             size="small"
//             endIcon={<VisibilityIcon />}
//             sx={{ textTransform: 'none' }}
//           >
//             View All
//           </Button>
//         </Box>

//         {activities.length === 0 ? (
//           <Box
//             sx={{
//               textAlign: 'center',
//               py: 4,
//               color: 'text.secondary',
//             }}
//           >
//             <Typography variant="body2">No recent activities</Typography>
//           </Box>
//         ) : (
//           <List sx={{ p: 0 }}>
//             {activities.map((activity, index) => (
//               <ListItem
//                 key={activity.id}
//                 sx={{
//                   px: 0,
//                   py: 1.5,
//                   borderBottom: index < activities.length - 1 ? '1px solid #f0f0f0' : 'none',
//                 }}
//               >
//                 <ListItemAvatar>
//                   <Avatar
//                     sx={{
//                       bgcolor: getActivityColor(activity.type),
//                       width: 40,
//                       height: 40,
//                     }}
//                   >
//                     {getActivityIcon(activity.type)}
//                   </Avatar>
//                 </ListItemAvatar>
                
//                 <ListItemText
//                   primary={
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontWeight: 500,
//                         mb: 0.5,
//                         lineHeight: 1.4,
//                       }}
//                     >
//                       {activity.title}
//                     </Typography>
//                   }
//                   secondary={
//                     <Box>
//                       <Typography
//                         variant="body2"
//                         color="text.secondary"
//                         sx={{ mb: 0.5, lineHeight: 1.3 }}
//                       >
//                         {activity.description}
//                       </Typography>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <Chip
//                           label={activity.status}
//                           size="small"
//                           color={getStatusColor(activity.status)}
//                           sx={{
//                             height: 20,
//                             fontSize: '0.7rem',
//                             fontWeight: 600,
//                           }}
//                         />
//                         <Typography
//                           variant="caption"
//                           color="text.secondary"
//                           sx={{ fontSize: '0.7rem' }}
//                         >
//                           {formatDistanceToNow(new Date(activity.timestamp), {
//                             addSuffix: true,
//                           })}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   }
//                 />
//               </ListItem>
//             ))}
//           </List>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default ActivityFeed;

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Skeleton,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = ({ activities = [], loading = false }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'employee':
        return <PersonIcon />;
      case 'job_posting':
        return <WorkIcon />;
      case 'application':
        return <AssignmentIcon />;
      case 'performance':
        return <TrendingUpIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'employee':
        return '#667eea';
      case 'job_posting':
        return '#764ba2';
      case 'application':
        return '#f093fb';
      case 'performance':
        return '#4facfe';
      default:
        return '#667eea';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':  
      case 'hired':
      case 'approved':
        return 'success';
      case 'pending':
      case 'under_review':
        return 'warning';
      case 'rejected':
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Activities
          </Typography>
          <List>
            {[1, 2, 3, 4, 5].map((item) => (
              <ListItem key={item} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton variant="text" width="60%" height={20} />}
                  secondary={<Skeleton variant="text" width="40%" height={16} />}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Recent Activities
          </Typography>
          <Button
            size="small"
            endIcon={<VisibilityIcon />}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>

        {activities.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2" component="div">
              No recent activities
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {activities.map((activity, index) => (
              <ListItem
                key={activity.id}
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: index < activities.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: getActivityColor(activity.type),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      component="div"   // ✅ FIX
                      sx={{
                        fontWeight: 500,
                        mb: 0.5,
                        lineHeight: 1.4,
                      }}
                    >
                      {activity.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        component="div"   // ✅ FIX
                        color="text.secondary"
                        sx={{ mb: 0.5, lineHeight: 1.3 }}
                      >
                        {activity.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={getStatusColor(activity.status)}
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        />
                        <Typography
                          variant="caption"
                          component="span"  // ✅ FIX
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
