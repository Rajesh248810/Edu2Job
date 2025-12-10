import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Container, Box,
    Avatar, Menu, MenuItem, IconButton, Divider
} from '@mui/material';
import {
    School as SchoolIcon,
    Brightness4,
    Brightness7,
    Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useThemeContext } from '../theme/ThemeContext';
import { NAV_ITEMS } from '../config';
import { API_BASE_URL } from '../config';

interface HeaderProps {
    onDrawerToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { mode, toggleTheme } = useThemeContext();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setMobileMenuAnchorEl(event.currentTarget);
    const handleMobileMenuClose = () => setMobileMenuAnchorEl(null);

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/');
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    };

    const navItems = [
        { label: 'Home', path: '/' },
        ...(user ? NAV_ITEMS : [])
    ];

    const textColor = mode === 'light' ? 'black' : 'white';

    return (
        <>
            <AppBar position="sticky" elevation={0} sx={{
                bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'background.paper',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
                zIndex: (theme) => theme.zIndex.drawer + 1
            }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Mobile Menu Icon (Dashboard Sidebar OR Header Menu) */}
                        {onDrawerToggle ? (
                            <IconButton
                                sx={{ mr: 2, display: { sm: 'none' }, color: textColor }}
                                aria-label="open drawer"
                                edge="start"
                                onClick={onDrawerToggle}
                            >
                                <MenuIcon />
                            </IconButton>
                        ) : (
                            <IconButton
                                sx={{ mr: 2, display: { md: 'none' }, color: textColor }}
                                aria-label="open mobile menu"
                                edge="start"
                                onClick={handleMobileMenuOpen}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        <SchoolIcon sx={{ color: '#2563eb', mr: 1, fontSize: 32 }} />
                        <Typography variant="h5" fontWeight="800" sx={{ flexGrow: 1, letterSpacing: -0.5, cursor: 'pointer', color: textColor }} onClick={() => navigate('/')}>
                            Edu2Job
                        </Typography>

                        {/* Desktop Navigation */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.label}
                                    onClick={() => navigate(item.path)}
                                    sx={{ color: textColor, fontWeight: 600, textTransform: 'none' }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        {/* Theme Toggle */}
                        <IconButton onClick={toggleTheme} sx={{ ml: 1, color: textColor }}>
                            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>

                        {user ? (
                            <>
                                <IconButton onClick={handleMenuOpen} sx={{ p: 0, border: '2px solid #2563eb', ml: 2 }}>
                                    <Avatar
                                        src={user.profile_picture ? `${API_BASE_URL}${user.profile_picture}` : undefined}
                                        sx={{ bgcolor: '#2563eb' }}
                                    >
                                        {getInitials(user.name)}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2, boxShadow: 3 } }}
                                >
                                    <Box sx={{ px: 2, py: 1 }}>
                                        <Typography fontWeight="bold">{user.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                    </Box>
                                    <Divider />
                                    <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>Dashboard</MenuItem>
                                    <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>My Profile</MenuItem>
                                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2, ml: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/login')}
                                    sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 'bold', color: textColor, borderColor: textColor }}
                                >
                                    Log In
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/register')}
                                    sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 'bold', boxShadow: 'none' }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Navigation Menu (Only when NOT in Dashboard) */}
            {!onDrawerToggle && (
                <Menu
                    anchorEl={mobileMenuAnchorEl}
                    open={Boolean(mobileMenuAnchorEl)}
                    onClose={handleMobileMenuClose}
                    PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2, boxShadow: 3 } }}
                >
                    {navItems.map((item) => (
                        <MenuItem key={item.label} onClick={() => { handleMobileMenuClose(); navigate(item.path); }}>
                            {item.label}
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </>
    );
};

export default Header;
