import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  HourglassBottom as HourglassIcon,
  Flag as FlagIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { performanceAPI } from '../../services/api';

// Map goal status to chip color and label
const statusMap = {
  completed: { label: 'Completed', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
  in_progress: { label: 'In Progress', color: 'primary', icon: <HourglassIcon fontSize="small" /> },
  not_started: { label: 'Not Started', color: 'default', icon: <FlagIcon fontSize="small" /> },
};

const LoadingGrid = () => (
  <Grid container spacing={3}>
    {Array.from({ length: 4 }).map((_, i) => (
      <Grid item xs={12} md={6} key={i}>
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardHeader
            avatar={<Skeleton variant="circular" width={40} height={40} />}
            title={<Skeleton width="60%" />}
            subheader={<Skeleton width="40%" />}
          />
          <CardContent>
            <Skeleton height={20} sx={{ mb: 1 }} />
            <Skeleton height={10} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const MyGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await performanceAPI.getGoals();
      // Depending on api wrapper, res may be { data } already. Normalize.
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setGoals(items);
    } catch (err) {
      // Graceful handling for missing backend
      setError(
        err?.response?.status === 404
          ? 'Goals endpoint not available. Backend implementation may be missing.'
          : err?.message || 'Failed to load goals.'
      );
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const progress = useMemo(() => {
    if (!goals.length) return 0;
    const completed = goals.filter((g) => g.status === 'completed').length;
    return Math.round((completed / goals.length) * 100);
  }, [goals]);

  return (
    <>
      <Helmet>
        <title>My Goals - NTFG HRMS</title>
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                My Goals
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track your goals and monitor progress
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Tooltip title="Refresh">
                <IconButton onClick={loadGoals}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Overall completion: {progress}%
              </Typography>
              <Box sx={{ flex: 1 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5 }} />
              </Box>
            </Stack>
          </Box>
        </Box>

        {!!error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <LoadingGrid />
        ) : goals.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>🎯</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                No goals yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don’t have any goals assigned. Once goals are created, they’ll show up here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {goals.map((g) => {
              const meta = statusMap[g.status] || statusMap.not_started;
              return (
                <Grid item xs={12} md={6} key={g.id || g._id || g.title}>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.25 }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                      <CardHeader
                        avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><AssignmentIcon /></Avatar>}
                        title={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6">{g.title || 'Untitled Goal'}</Typography>
                            <Chip
                              size="small"
                              color={meta.color}
                              label={meta.label}
                              icon={meta.icon}
                            />
                          </Stack>
                        }
                        subheader={g.category || g.owner || 'Personal'}
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {g.description || 'No description provided.'}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={typeof g.progress === 'number' ? g.progress : g.status === 'completed' ? 100 : g.status === 'in_progress' ? 50 : 0}
                              sx={{ height: 8, borderRadius: 5 }}
                              color={meta.color === 'default' ? 'inherit' : meta.color}
                            />
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {typeof g.progress === 'number' ? g.progress : g.status === 'completed' ? 100 : g.status === 'in_progress' ? 50 : 0}%
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        )}
      </motion.div>
    </>
  );
};

export default MyGoals;