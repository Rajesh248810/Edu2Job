import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { getTheme } from '../theme';

import { useAuth } from '../auth/AuthContext';

type ThemeMode = 'light' | 'dark' | 'prime';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    toggleTheme: () => { },
    setTheme: () => { },
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [mode, setMode] = useState<ThemeMode>(() => {
        const savedMode = localStorage.getItem('themeMode');
        return (savedMode as ThemeMode) || 'light';
    });

    // Auto-switch to Prime theme if user becomes Prime
    useEffect(() => {
        if (user?.is_prime && mode !== 'prime') {
            // Optional: If you want to force it, or just notify. 
            // Let's force it for the full "Golden Experience" initially, 
            // but user should be able to switch back if they want (not implemented here yet).
            // For now, let's just default to it once.
            setMode('prime');
        }
    }, [user?.is_prime]);

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => {
            if (prevMode === 'light') return 'dark';
            if (prevMode === 'dark') return user?.is_prime ? 'prime' : 'light';
            return 'light'; // If prime, go back to light
        });
    };

    const setTheme = (newMode: ThemeMode) => setMode(newMode);

    const theme = useMemo(() => getTheme(mode), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles styles={{
                    'body': {
                        background: mode === 'prime'
                            ? 'radial-gradient(circle at center, #1a1a00 0%, #000000 100%)' // Subtle Gold-Black
                            : mode === 'dark'
                                ? 'radial-gradient(ellipse at bottom left, rgba(102,126,234,0.12), transparent 20%), linear-gradient(120deg, #071029 0%, #0b2340 100%)'
                                : '#f3f2ef',
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
