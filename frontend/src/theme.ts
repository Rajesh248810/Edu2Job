import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
          // Light Mode (LinkedIn Style)
          primary: {
            main: '#0a66c2', // LinkedIn Blue
            contrastText: '#fff',
          },
          secondary: {
            main: '#764ba2',
          },
          background: {
            default: '#f3f2ef', // LinkedIn Light Gray
            paper: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.9)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        }
        : {
          // Dark Mode (Existing)
          primary: {
            main: '#667eea',
            contrastText: '#fff',
          },
          secondary: {
            main: '#764ba2',
          },
          background: {
            default: '#071029',
            paper: '#1e293b', // Solid Dark Blue-Gray for better readability
          },
          text: {
            primary: 'rgba(255,255,255,0.92)',
            secondary: 'rgba(255,255,255,0.72)',
          },
        }),
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: ['Inter', 'Helvetica', 'Arial', 'sans-serif'].join(','),
      h3: { fontWeight: 800 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundClip: 'padding-box',
          },
        },
      },
    },
  });
};
