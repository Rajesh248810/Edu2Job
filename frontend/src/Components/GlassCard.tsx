import React from 'react';
import { Box, Paper } from '@mui/material';

interface Props {
  children: React.ReactNode;
  sx?: any;
  elevation?: number;
}

const GlassCard: React.FC<Props> = ({ children, sx = {}, elevation = 3 }) => {
  return (
    <Paper
      elevation={elevation}
      sx={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 30px rgba(2,6,23,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 4,
        p: 2.5,
        color: 'text.primary',
        ...sx
      }}
    >
      <Box>{children}</Box>
    </Paper>
  );
};

export default GlassCard;
