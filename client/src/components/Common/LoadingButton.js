import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';

const LoadingButton = ({
  loading = false,
  children,
  startIcon,
  endIcon,
  disabled,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
    >
      {loading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mr: startIcon ? 1 : 0,
            ml: endIcon ? 1 : 0,
          }}
        >
          <CircularProgress
            size={16}
            sx={{
              color: 'inherit',
            }}
          />
        </Box>
      )}
      {children}
    </Button>
  );
};

export default LoadingButton;