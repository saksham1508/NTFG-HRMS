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
//   School as SchoolIcon,
// } from '@mui/icons-material';
// import { Helmet } from 'react-helmet-async';
// import { motion } from 'framer-motion';

// const Training = () => {
//   return (
//     <>
//       <Helmet>
//         <title>Training & Development - NTFG HRMS</title>
//       </Helmet>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <Box sx={{ mb: 4 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//             <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 48, height: 48 }}>
//               <SchoolIcon />
//             </Avatar>
//             <Box>
//               <Typography variant="h4" sx={{ fontWeight: 700 }}>
//                 Training & Development
//                 <Chip label="Coming Soon" size="small" color="warning" sx={{ ml: 2 }} />
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 AI-powered learning paths and skill development
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         <Card>
//           <CardContent sx={{ textAlign: 'center', py: 8 }}>
//             <Typography variant="h3" sx={{ mb: 2 }}>🎓</Typography>
//             <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
//               Training & Development Platform
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               Personalized learning experiences with AI recommendations coming soon...
//             </Typography>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </>
//   );
// };

// export default Training;


import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Button,
} from "@mui/material";
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
  Computer as ComputerIcon,
} from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const programs = [
  {
    id: 1,
    title: "Full Stack Development",
    description: "Master frontend & backend with React, Node.js, and MongoDB.",
    duration: "3 Months",
    icon: <CodeIcon />,
    color: "primary",
    status: "Ongoing",
  },
  {
    id: 2,
    title: "AI & Machine Learning",
    description: "Hands-on projects with Python, TensorFlow, and Scikit-Learn.",
    duration: "2 Months",
    icon: <ComputerIcon />,
    color: "secondary",
    status: "Upcoming",
  },
  {
    id: 3,
    title: "Business Communication",
    description: "Improve communication, leadership, and presentation skills.",
    duration: "1 Month",
    icon: <BusinessIcon />,
    color: "success",
    status: "Ongoing",
  },
  {
    id: 4,
    title: "Foreign Languages",
    description: "Learn global languages for international opportunities.",
    duration: "6 Weeks",
    icon: <LanguageIcon />,
    
    color: "warning",
    status: "Upcoming",
  },
];

const Training = () => {
  return (
    <>
      <Helmet>
        <title>Training & Development - NTFG HRMS</title>
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
              sx={{ bgcolor: "warning.main", mr: 2, width: 48, height: 48 }}
            >
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Training & Development
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Explore AI-powered learning paths and skill development programs
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Training Programs Grid */}
        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid item xs={12} sm={6} md={4} key={program.id}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: `${program.color}.main`,
                        width: 56,
                        height: 56,
                        mb: 2,
                      }}
                    >
                      {program.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {program.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {program.description}
                    </Typography>
                    <Chip
                      label={program.status}
                      color={
                        program.status === "Ongoing" ? "success" : "warning"
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" display="block" gutterBottom>
                      Duration: {program.duration}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 2, borderRadius: 2 }}
                      disabled={program.status === "Upcoming"}
                    >
                      {program.status === "Ongoing" ? "Join Now" : "Coming Soon"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </>
  );
};

export default Training;
