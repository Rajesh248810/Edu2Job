import React, { useState } from 'react';
import { Box, Container, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText, Alert, CircularProgress } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const loadScript = (src: string) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const UpgradePage: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            setError('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        try {
            // 1. Create Order
            const result = await api.post('/api/payment/create-order/');
            const { amount, order_id, currency, key_id } = result.data;

            // 2. Initialize Razorpay
            const options = {
                key: key_id,
                amount: amount.toString(),
                currency: currency,
                name: 'Edu2Job Prime',
                description: 'Upgrade to Prime Membership',
                image: '/assets/logo.svg', // Ensure this exists or use a default
                order_id: order_id, // Use extracted variable
                handler: async function (response: any) {
                    console.log("DEBUG: Razorpay Response:", response);
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        };
                        console.log("DEBUG: Sending Verify Data:", verifyData);

                        // 3. Verify Payment
                        await api.post('/api/payment/verify/', verifyData);

                        // 4. Update Local User State
                        await refreshUser();
                        navigate('/dashboard');

                    } catch (err: any) {
                        console.error(err);
                        setError(err.response?.data?.error || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: ''
                },
                theme: {
                    color: '#FFD700'
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
            setLoading(false);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Could not initiate payment');
            setLoading(false);
        }
    };

    if (user?.is_prime) {
        return (
            <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                <Paper elevation={3} sx={{ p: 5, borderRadius: 4, bgcolor: '#fffbed', border: '2px solid #FFD700' }}>
                    <VerifiedIcon sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        You are a Prime Member!
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        Enjoy your exclusive benefits.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" fontWeight="900" gutterBottom sx={{
                    background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Upgrade to Prime
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Unlock exclusive features and stand out from the crowd.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Paper elevation={4} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden', borderRadius: 4 }}>
                <Box sx={{ p: 4, flex: 1, bgcolor: '#f8fafc' }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Free Plan
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Basic Career Prediction" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Resume Builder" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Job Search" />
                        </ListItem>
                    </List>
                </Box>
                <Box sx={{ p: 4, flex: 1, bgcolor: '#1e293b', color: 'white', position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: '#FFD700', color: 'black', px: 2, py: 0.5, fontWeight: 'bold' }}>
                        RECOMMENDED
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#FFD700', mb: 1 }}>
                        Prime Plan
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 3 }}>
                        ₹1 <Typography component="span" variant="body1" sx={{ color: 'grey.400' }}>/ year</Typography>
                    </Typography>

                    <List sx={{ mb: 4 }}>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemIcon><VerifiedIcon sx={{ color: '#FFD700' }} /></ListItemIcon>
                            <ListItemText primary="Prime Profile Badge" secondaryTypographyProps={{ sx: { color: 'grey.400' } }} secondary="Stand out to recruiters" />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemIcon><VerifiedIcon sx={{ color: '#FFD700' }} /></ListItemIcon>
                            <ListItemText primary="View Contact Details" secondaryTypographyProps={{ sx: { color: 'grey.400' } }} secondary="See emails of other users" />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemIcon><VerifiedIcon sx={{ color: '#FFD700' }} /></ListItemIcon>
                            <ListItemText primary="Hire Me Tag" secondaryTypographyProps={{ sx: { color: 'grey.400' } }} secondary="Signal your availability" />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemIcon><VerifiedIcon sx={{ color: '#FFD700' }} /></ListItemIcon>
                            <ListItemText primary="Prediction Insights" secondaryTypographyProps={{ sx: { color: 'grey.400' } }} secondary="View others' last prediction" />
                        </ListItem>
                    </List>

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handlePayment}
                        disabled={loading}
                        sx={{
                            bgcolor: '#FFD700',
                            color: 'black',
                            fontWeight: 'bold',
                            '&:hover': { bgcolor: '#FFC107' }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Prime Now'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default UpgradePage;
