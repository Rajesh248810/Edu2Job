import React, { useState } from 'react';
import {
    Box, CssBaseline, Drawer, List,
    Divider, ListItem, ListItemButton, ListItemIcon, ListItemText
} from '@mui/material';
import {
    Logout as LogoutIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Header from './Header';
import { NAV_ITEMS } from '../config';

const drawerWidth = 260;

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleNavigation = (path: string) => {
        if (path === '/logout') {
            logout();
            navigate('/login');
        } else {
            navigate(path);
        }
        setMobileOpen(false);
    };

    const menuItems = NAV_ITEMS.map(item => ({
        text: item.label,
        icon: <item.icon />,
        path: item.path
    }));

    const drawer = (
        <div>
            <List sx={{ px: 2, mt: 2 }}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton onClick={() => handleNavigation('/')} sx={{ borderRadius: 2 }}>
                        <ListItemIcon><HomeIcon /></ListItemIcon>
                        <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
                <Divider sx={{ my: 1 }} />
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main' },
                                '&.Mui-selected:hover': { bgcolor: 'primary.light' }
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <List sx={{ px: 2, mb: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation('/logout')} sx={{ borderRadius: 2, color: 'error.main' }}>
                        <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <CssBaseline />

            {/* Shared Header */}
            <Header onDrawerToggle={handleDrawerToggle} />

            {/* Content Area (Sidebar + Main) */}
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
                <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
                    >
                        {drawer}
                    </Drawer>
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                                borderRight: 'none',
                                boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
                                height: 'calc(100% - 64px)', // Adjust height to account for Header
                                top: 64, // Push down by Header height
                            }
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>

                {/* Main Content */}
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, overflow: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardLayout;
