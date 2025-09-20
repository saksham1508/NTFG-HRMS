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
//   BeachAccess as BeachAccessIcon,
// } from '@mui/icons-material';
// import { Helmet } from 'react-helmet-async';
// import { motion } from 'framer-motion';

// const Leave = () => {
//   return (
//     <>
//       <Helmet>
//         <title>Leave Management - NTFG HRMS</title>
//       </Helmet>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <Box sx={{ mb: 4 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//             <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 48, height: 48 }}>
//               <BeachAccessIcon />
//             </Avatar>
//             <Box>
//               <Typography variant="h4" sx={{ fontWeight: 700 }}>
//                 Leave Management
//                 <Chip label="Coming Soon" size="small" color="warning" sx={{ ml: 2 }} />
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 Smart leave tracking and approval workflows
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         <Card>
//           <CardContent sx={{ textAlign: 'center', py: 8 }}>
//             <Typography variant="h3" sx={{ mb: 2 }}>🏖️</Typography>
//             <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
//               Leave Management System
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               Intelligent leave management with automated approvals coming soon...
//             </Typography>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </>
//   );
// };

// export default Leave;

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  BeachAccess as BeachAccessIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  EventAvailable as PaidIcon,

} from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const leaveSummary = {
  approved: 8,
  pending: 3,
  rejected: 2,
  paidLeave: 10,
  unpaidLeave: 5,
  remainingLeave: 12,
};

const leaveRequests = [
  {
    id: 1,
    employee: "Ratan Yadav",
    date: "2025-09-14",
    type: "Paid",
    status: "Approved",
  },
  {
    id: 2,
    employee: "Priya Sharma",
    date: "2025-09-16",
    type: "Unpaid",
    status: "Pending",
  },
  {
    id: 3,
    employee: "Amit Verma",
    date: "2025-09-18",
    type: "Paid",
    status: "Pending",
  },
  {
    id: 4,
    employee: "Sneha Kapoor",
    date: "2025-09-10",
    type: "Paid",
    status: "Rejected",
  },
];

const statusColor = {
  Approved: "success",
  Pending: "warning",
  Rejected: "error",
};

const Leave = () => {
  return (
    <>
      <Helmet>
        <title>Leave Management - NTFG HRMS</title>
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
              sx={{ bgcolor: "info.main", mr: 2, width: 48, height: 48 }}
            >
              <BeachAccessIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Leave Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track leave requests and balances in real-time
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Leave Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <ApprovedIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{leaveSummary.approved}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Leaves
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <PendingIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{leaveSummary.pending}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <RejectedIcon color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{leaveSummary.rejected}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected Requests
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <PaidIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {leaveSummary.remainingLeave}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remaining Paid Leave
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Leave Requests Table */}
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Leave Requests
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.employee}</TableCell>
                      <TableCell>{req.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={req.type}
                          color={req.type === "Paid" ? "primary" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={req.status}
                          color={statusColor[req.status]}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Leave;
