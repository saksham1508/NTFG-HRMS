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
//   Assessment as AssessmentIcon,
// } from '@mui/icons-material';
// import { Helmet } from 'react-helmet-async';
// import { motion } from 'framer-motion';

// const Performance = () => {
//   return (
//     <>
//       <Helmet>
//         <title>Performance Management - NTFG HRMS</title>
//       </Helmet>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <Box sx={{ mb: 4 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//             <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 48, height: 48 }}>
//               <AssessmentIcon />
//             </Avatar>
//             <Box>
//               <Typography variant="h4" sx={{ fontWeight: 700 }}>
//                 Performance Management
//                 <Chip label="Coming Soon" size="small" color="warning" sx={{ ml: 2 }} />
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 AI-driven performance analytics and goal tracking
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         <Card>
//           <CardContent sx={{ textAlign: 'center', py: 8 }}>
//             <Typography variant="h3" sx={{ mb: 2 }}>📈</Typography>
//             <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
//               Performance Management Module
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               Advanced performance tracking with AI insights coming soon...
//             </Typography>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </>
//   );
// };

// export default Performance;

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const employees = [
  {
    id: "E101",
    name: "Ratan Yadav",
    role: "Full Stack Developer",
    performance: 85,
  },
  {
    id: "E102",
    name: "Priya Sharma",
    role: "UI/UX Designer",
    performance: 72,
  },
  {
    id: "E103",
    name: "Amit Verma",
    role: "Backend Engineer",
    performance: 60,
  },
  {
    id: "E104",
    name: "Sneha Kapoor",
    role: "HR Manager",
    performance: 92,
  },
];

const getPerformanceStatus = (score) => {
  if (score >= 80) return { label: "Excellent", color: "success" };
  if (score >= 60) return { label: "Good", color: "warning" };
  return { label: "Needs Improvement", color: "error" };
};

const Performance = () => {
  return (
    <>
      <Helmet>
        <title>Performance Management - NTFG HRMS</title>
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
              sx={{ bgcolor: "success.main", mr: 2, width: 48, height: 48 }}
            >
              <AssessmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Performance Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track employee performance and growth
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Employee Performance Grid */}
        <Grid container spacing={3}>
          {employees.map((emp) => {
            const status = getPerformanceStatus(emp.performance);
            return (
              <Grid item xs={12} md={6} key={emp.id}>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                      {/* Employee Info */}
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{emp.name}</Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <WorkIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {emp.role}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Performance Score */}
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Performance Score
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {emp.performance}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={emp.performance}
                          sx={{ height: 8, borderRadius: 5 }}
                          color={status.color}
                        />
                      </Box>

                      {/* Status Chip */}
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </motion.div>
    </>
  );
};

export default Performance;
