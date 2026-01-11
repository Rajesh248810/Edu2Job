import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, ListItemText } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Notification {
    notification_id: number;
    message: string;
    is_read: boolean;
    created_at: string;
    type: string;
}

interface NotificationBellProps {
    sx?: any;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ sx }) => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/notifications/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [token]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        // Mark all as read conceptually, or one by one? 
        // Let's mark as read when opened or clicked.
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.is_read) {
            try {
                await axios.patch(`${API_BASE_URL}/api/notifications/${notification.notification_id}/`,
                    { is_read: true },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Update local state
                setNotifications(notifications.map(n =>
                    n.notification_id === notification.notification_id ? { ...n, is_read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error("Failed to mark read");
            }
        }

        // Navigate if it's a ticket reply
        if (notification.type === 'ticket_reply' && notification.message.includes('Support Agent')) {
            // This is a rough heuristic, ideally we'd send ticket_id in notification payload
            // For now, simpler to just go to HelpCenter or My Tickets list
            navigate('/help-center'); // Or specific ticket if we had ID
        }

        handleClose();
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick} sx={sx}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 320, maxHeight: 400 }
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6">Notifications</Typography>
                </Box>
                {notifications.length === 0 ? (
                    <MenuItem disabled>No notifications</MenuItem>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.notification_id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                whiteSpace: 'normal',
                                bgcolor: notification.is_read ? 'inherit' : 'action.hover'
                            }}
                        >
                            <ListItemText
                                primary={notification.message}
                                secondary={new Date(notification.created_at).toLocaleString()}
                            />
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;
