import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, color, trend, loading = false }) => {
  if (loading) {
    return (
      <Card sx={{ height: 140 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
            <Skeleton variant="text" width={120} height={24} />
          </Box>
          <Skeleton variant="text" width={80} height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={100} height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          height: 140,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: color,
                width: 48,
                height: 48,
                mr: 2,
              }}
            >
              {icon}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {title}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: 'text.primary',
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>

          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                icon={
                  trend.isPositive ? (
                    <ArrowUpwardIcon sx={{ fontSize: '16px !important' }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ fontSize: '16px !important' }} />
                  )
                }
                label={`${trend.value}%`}
                size="small"
                sx={{
                  bgcolor: trend.isPositive ? 'success.light' : 'error.light',
                  color: trend.isPositive ? 'success.dark' : 'error.dark',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                vs last month
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;