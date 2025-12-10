import React, { useState } from 'react';
import { Box, Container, Typography, Link, IconButton, TextField, Button, Stack, Divider, Alert } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram, Send } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import api from '../api';

const Footer: React.FC = () => {
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!email) return;
        setLoading(true);
        setMessage(null);
        try {
            const response = await api.post('/api/subscribe/', { email });
            setMessage({ type: 'success', text: response.data.message });
            setEmail('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to subscribe' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f8f9fa',
                color: 'text.primary',
                pt: 6,
                pb: 3,
                borderTop: `1px solid ${theme.palette.divider}`,
                mt: 'auto',
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 2fr 2fr 4fr' }, gap: 4 }}>
                    {/* Brand Section */}
                    <Box>
                        <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Edu2Job
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 300 }}>
                            Bridging the gap between education and employment. We provide the tools and resources you need to succeed in your career journey.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <IconButton aria-label="Facebook" color="inherit" size="small">
                                <Facebook />
                            </IconButton>
                            <IconButton aria-label="Twitter" color="inherit" size="small">
                                <Twitter />
                            </IconButton>
                            <IconButton aria-label="LinkedIn" color="inherit" size="small">
                                <LinkedIn />
                            </IconButton>
                            <IconButton aria-label="Instagram" color="inherit" size="small">
                                <Instagram />
                            </IconButton>
                        </Stack>
                    </Box>

                    {/* Quick Links */}
                    <Box>
                        <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Quick Links
                        </Typography>
                        <Stack spacing={1}>
                            <Link href="/" color="text.secondary" underline="hover">Home</Link>
                            <Link href="/community" color="text.secondary" underline="hover">Community</Link>
                            <Link href="/dashboard" color="text.secondary" underline="hover">Dashboard</Link>
                            <Link href="/login" color="text.secondary" underline="hover">Login</Link>
                        </Stack>
                    </Box>

                    {/* Resources */}
                    <Box>
                        <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Resources
                        </Typography>
                        <Stack spacing={1}>
                            <Link href="#" color="text.secondary" underline="hover">Blog</Link>
                            <Link href="#" color="text.secondary" underline="hover">Documentation</Link>
                            <Link href="#" color="text.secondary" underline="hover">Help Center</Link>
                            <Link href="#" color="text.secondary" underline="hover">FAQs</Link>
                        </Stack>
                    </Box>

                    {/* Newsletter */}
                    <Box>
                        <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Stay Updated
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Subscribe to our newsletter for the latest updates and career tips.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                size="small"
                                placeholder="Your email address"
                                variant="outlined"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ bgcolor: 'background.default' }}
                            />
                            <Button
                                variant="contained"
                                endIcon={<Send />}
                                sx={{ minWidth: '100px' }}
                                onClick={handleSubscribe}
                                disabled={loading}
                            >
                                {loading ? '...' : 'Subscribe'}
                            </Button>
                        </Stack>
                        {message && (
                            <Alert severity={message.type} sx={{ mt: 2, py: 0, px: 1, fontSize: '0.8rem' }}>
                                {message.text}
                            </Alert>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} Edu2Job. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3} sx={{ mt: { xs: 2, sm: 0 } }}>
                        <Link href="/privacy-policy" color="text.secondary" underline="hover" variant="body2">Privacy Policy</Link>
                        <Link href="/terms-of-service" color="text.secondary" underline="hover" variant="body2">Terms of Service</Link>
                        <Link href="#" color="text.secondary" underline="hover" variant="body2">Cookie Policy</Link>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
