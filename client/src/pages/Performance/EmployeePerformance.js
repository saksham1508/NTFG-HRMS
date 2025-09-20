import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { employeeAPI, aiAPI, attendanceAPI, performanceByEmployeeAPI } from '../../services/api';

// Small helper to format names/labels safely
const safe = (v, fallback = '-') => (v === null || v === undefined || v === '' ? fallback : v);

// Build mock attendance when backend endpoint isn't ready
const buildMockAttendance = () => {
  const days = 30;
  const records = [];
  let present = 0;
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Random-ish presence for demo UI
    const isPresent = Math.random() > 0.08; // ~92% attendance
    present += isPresent ? 1 : 0;
    records.push({
      date: date.toISOString(),
      status: isPresent ? 'present' : 'absent',
      checkIn: isPresent ? '09:30' : null,
      checkOut: isPresent ? '18:15' : null,
    });
  }
  return {
    rangeDays: days,
    present,
    total: days,
    attendanceRate: present / days,
    records,
  };
};

const performanceColor = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
};

const EmployeePerformance = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const [employee, setEmployee] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [perfSummary, setPerfSummary] = useState(null);
  const [perfReviews, setPerfReviews] = useState([]);
  const [error, setError] = useState(null);

  const fullName = useMemo(() => {
    if (!employee) return '-';
    const p = employee.profile || {};
    return `${safe(p.firstName, '')} ${safe(p.lastName, '')}`.trim() || employee.email || '-';
  }, [employee]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Resolve target employee ID: accept either Mongo _id or employeeId like E101
        const isMongoId = /^[a-fA-F0-9]{24}$/.test(id);
        let targetId = id;
        if (!isMongoId) {
          try {
            const listRes = await employeeAPI.getEmployees({ search: id, limit: 1 });
            const items = listRes?.data?.employees || listRes?.employees || [];
            if (items.length > 0) {
              targetId = items[0]._id || items[0].id || targetId;
            } else {
              throw new Error('Employee not found');
            }
          } catch (e) {
            if (mounted) {
              setError('Employee not found');
              setLoading(false);
            }
            return;
          }
        }

        // 1) Employee details
        const empRes = await employeeAPI.getEmployee(targetId);
        // employeeAPI returns { success, data: { employee } }
        const emp = empRes?.data?.employee || empRes?.employee || empRes?.data || null;
        if (mounted) setEmployee(emp);

        // 2) AI Predict Performance (server route exists)
        try {
          const predRes = await aiAPI.predictPerformance(targetId);
          // aiAPI returns { success, data: { employee, prediction } }
          const pred = predRes?.data?.prediction || predRes?.prediction || null;
          if (mounted) setPrediction(pred);
        } catch (e) {
          // Non-fatal for page
          console.warn('AI prediction failed or unauthorized:', e?.message || e);
        }

        // 2b) Performance Summary & Reviews
        try {
          const [summaryRes, reviewsRes] = await Promise.all([
            performanceByEmployeeAPI.getSummary(targetId),
            performanceByEmployeeAPI.getReviews(targetId, { page: 1, limit: 5 }),
          ]);
          const summary = summaryRes?.data || summaryRes;
          const reviews = reviewsRes?.data?.items || reviewsRes?.items || [];
          if (mounted) {
            setPerfSummary(summary?.data || summary);
            setPerfReviews(reviews);
          }
        } catch (e) {
          console.warn('Performance summary/reviews unavailable:', e?.message || e);
        }

        // 3) Attendance summary (try API, otherwise mock)
        try {
          const to = new Date();
          const from = new Date();
          from.setDate(to.getDate() - 29);
          const attRes = await attendanceAPI.getSummary(targetId, {
            from: from.toISOString(),
            to: to.toISOString(),
          });
          // handle both shapes: { success, data } or plain object
          const data = attRes?.data || attRes;
          if (mounted) setAttendance(data?.data || data);
        } catch (e) {
          if (mounted) setAttendance(buildMockAttendance());
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError('Failed to load employee performance');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  const employeeInfo = (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <PersonIcon />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700}>
              {fullName}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Chip
                size="small"
                icon={<WorkIcon />}
                label={safe(employee?.employment?.position, 'Position -')}
              />
              <Chip
                size="small"
                color="info"
                icon={<BusinessIcon />}
                label={safe(employee?.employment?.department, 'Department -')}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`Employee ID: ${safe(employee?.employeeId, '-')}`}
              />
            </Box>
          </Box>
          <Tooltip title="Back">
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  const performanceOverview = (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'success.main' }}>
            <InsightsIcon />
          </Avatar>
        }
        title="Performance Overview"
        subheader="AI prediction and recent metrics"
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Predicted Performance
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <TrendingUpIcon color="action" />
              <Typography variant="h6" fontWeight={700}>
                {prediction?.score ? Math.round(prediction.score * 100) : '--'}%
              </Typography>
              {prediction?.score !== undefined && (
                <Chip
                  size="small"
                  color={performanceColor(Math.round(prediction.score * 100))}
                  label={
                    Math.round(prediction.score * 100) >= 80
                      ? 'Excellent'
                      : Math.round(prediction.score * 100) >= 60
                      ? 'Good'
                      : 'Needs Improvement'
                  }
                />
              )}
            </Box>
            {prediction?.factors && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Key Factors
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  {prediction.factors.slice(0, 6).map((f, idx) => (
                    <Chip key={idx} size="small" variant="outlined" label={`${f.name}: ${Math.round(f.weight * 100)}%`} />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Overall Score (AI)
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Box flex={1}>
                <LinearProgress
                  variant="determinate"
                  value={prediction?.score ? Math.round(prediction.score * 100) : 0}
                  sx={{ height: 10, borderRadius: 8 }}
                  color={performanceColor(Math.round((prediction?.score || 0) * 100))}
                />
              </Box>
              <Typography variant="body2" sx={{ minWidth: 36, textAlign: 'right' }}>
                {prediction?.score ? Math.round(prediction.score * 100) : 0}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              AI estimate. Actual reviews are shown below.
            </Typography>

            {/* Aggregated from actual performance reviews */}
            <Box mt={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Performance Summary (Reviews)
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  size="small"
                  color={performanceColor(perfSummary?.averageScore || 0)}
                  label={`Avg Score: ${perfSummary?.averageScore ?? '--'}`}
                />
                {perfSummary?.latestReview && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Latest: ${perfSummary.latestReview.overallScore ?? '--'}`}
                  />
                )}
              </Box>

              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Recent Reviews
                </Typography>
                <List dense sx={{ maxHeight: 180, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  {(perfReviews || []).slice(0, 3).map((r, idx) => (
                    <React.Fragment key={r._id || idx}>
                      <ListItem>
                        <ListItemText
                          primary={`Score: ${r.overallScore ?? '--'}`}
                          secondary={
                            r.period?.from && r.period?.to
                              ? `${new Date(r.period.from).toLocaleDateString()} - ${new Date(r.period.to).toLocaleDateString()}`
                              : r.createdAt
                              ? new Date(r.createdAt).toLocaleDateString()
                              : ''
                          }
                        />
                      </ListItem>
                      {idx < Math.min(2, (perfReviews || []).length - 1) && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                  {(perfReviews || []).length === 0 && (
                    <ListItem>
                      <ListItemText primary="No reviews yet" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const attendanceSection = (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AccessTimeIcon />
          </Avatar>
        }
        title="Attendance (last 30 days)"
        subheader="This section falls back to sample data if attendance API is not available"
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h4" fontWeight={700}>
                {attendance ? Math.round((attendance.attendanceRate || 0) * 100) : '--'}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendance Rate
              </Typography>
            </Box>
            <Box mt={2} display="flex" gap={1}>
              <Chip
                color="success"
                icon={<CheckCircleIcon />}
                label={`Present: ${attendance?.present ?? '--'}`}
                size="small"
              />
              <Chip
                color="error"
                icon={<CancelIcon />}
                label={`Absent: ${attendance ? (attendance.total - attendance.present) : '--'}`}
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Recent Records
            </Typography>
            <List dense sx={{ maxHeight: 260, overflowY: 'auto', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {(attendance?.records || []).slice(0, 15).map((r, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemIcon>
                      {r.status === 'present' ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <CancelIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={new Date(r.date).toLocaleDateString()}
                      secondary={
                        r.status === 'present'
                          ? `Check-in: ${r.checkIn || '--'} • Check-out: ${r.checkOut || '--'}`
                          : 'Absent'
                      }
                    />
                  </ListItem>
                  {idx < 14 && <Divider component="li" />}
                </React.Fragment>
              ))}
              {(!attendance || (attendance.records || []).length === 0) && (
                <ListItem>
                  <ListItemText primary="No attendance data available" />
                </ListItem>
              )}
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Employee Performance - NTFG HRMS</title>
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Employee Performance
          </Typography>
          <Chip label={loading ? 'Loading...' : 'Ready'} color={loading ? 'warning' : 'success'} size="small" />
        </Box>

        {/* Employee Summary */}
        {employeeInfo}

        <Box mt={3}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
            <Tab label="Overview" />
            <Tab label="Attendance" />
          </Tabs>
        </Box>

        <Box mt={2}>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {performanceOverview}
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {attendanceSection}
              </Grid>
            </Grid>
          )}
        </Box>

        {error && (
          <Box mt={2}>
            <Chip color="error" label={error} />
          </Box>
        )}
      </motion.div>
    </>
  );
};

export default EmployeePerformance;