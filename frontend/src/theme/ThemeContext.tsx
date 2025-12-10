import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { getTheme } from '../theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    toggleTheme: () => { },
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const savedMode = localStorage.getItem('themeMode');
        return (savedMode as ThemeMode) || 'light'; // Default to light as requested
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => getTheme(mode), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles styles={{
                    'body': {
                        background: mode === 'dark'
                            ? 'radial-gradient(ellipse at bottom left, rgba(102,126,234,0.12), transparent 20%), linear-gradient(120deg, #071029 0%, #0b2340 100%)'
                            : '#f3f2ef', // LinkedIn Light Gray
                        backgroundAttachment: 'fixed',
                        minHeight: '100vh',
                        transition: 'background 0.3s ease-in-out'
                    }
                }} />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};
