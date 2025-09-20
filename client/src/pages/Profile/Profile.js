// import React from 'react';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Avatar,
//   Chip,
// } from '@mui/material';
// import {
//   Person as PersonIcon,
// } from '@mui/icons-material';
// import { Helmet } from 'react-helmet-async';
// import { motion } from 'framer-motion';

// const Profile = () => {
//   return (
//     <>
//       <Helmet>
//         <title>My Profile - NTFG HRMS</title>
//       </Helmet>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <Box sx={{ mb: 4 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//             <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
//               <PersonIcon />
//             </Avatar>
//             <Box>
//               <Typography variant="h4" sx={{ fontWeight: 700 }}>
//                 My Profile
//                 <Chip label="Coming Soon" size="small" color="warning" sx={{ ml: 2 }} />
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 Manage your personal information and preferences
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         <Card>
//           <CardContent sx={{ textAlign: 'center', py: 8 }}>
//             <Typography variant="h3" sx={{ mb: 2 }}>👤</Typography>
//             <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
//               Profile Management
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               Comprehensive profile management with AI-powered insights coming soon...
//             </Typography>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </>
//   );
// };

// export default Profile;

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Work as WorkIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const employeeData = {
  employeeId: "NTFG12345",
  name: "Ratan Yadav",
  dob: "28 Oct 2002",
  role: "Software Engineer",
  position: "Full Stack Developer",
  performance: 82, // %
  attendance: "95%",
};

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
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{ bgcolor: "primary.main", mr: 2, width: 56, height: 56 }}
            >
              <PersonIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {employeeData.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your personal information and track performance
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Profile Details */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Employee ID:{" "}
                    <Typography component="span" color="text.secondary">
                      {employeeData.employeeId}
                    </Typography>
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <WorkIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Role:{" "}
                    <Typography component="span" color="text.secondary">
                      {employeeData.role}
                    </Typography>
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AssignmentTurnedInIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Position:{" "}
                    <Typography component="span" color="text.secondary">
                      {employeeData.position}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>

              {/* Personal Info */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CalendarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Date of Birth:{" "}
                    <Typography component="span" color="text.secondary">
                      {employeeData.dob}
                    </Typography>
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Attendance:{" "}
                    <Chip
                      label={employeeData.attendance}
                      color="success"
                      size="small"
                    />
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Performance Card */}
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Performance Overview
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Score:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {employeeData.performance}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={employeeData.performance}
              sx={{
                height: 10,
                borderRadius: 5,
              }}
              color={
                employeeData.performance > 75
                  ? "success"
                  : employeeData.performance > 50
                  ? "warning"
                  : "error"
              }
            />
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Profile;
