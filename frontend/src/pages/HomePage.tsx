import React from 'react';
import {
    Box, Typography, Button, Container,
    Avatar, Card, CardContent, Dialog, DialogContent, Chip
} from '@mui/material';
import GlassCard from '../Components/GlassCard';
import {
    TrendingUp as TrendingUpIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../Components/LoginForm';
import RegisterForm from '../Components/RegisterForm';
import { useAuth } from '../auth/AuthContext';

const TOP_STUDENTS = [
    { name: "Sanya G.", role: "Software Engineer @ Google", img: "SG" },
    { name: "Rahul V.", role: "Data Scientist @ Amazon", img: "RV" },
    { name: "Amit P.", role: "Product Manager @ Microsoft", img: "AP" },
];

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Determine auth mode from URL
    const isLogin = location.pathname === '/login';
    const isRegister = location.pathname === '/register';
    const isAuthOpen = isLogin || isRegister;

    const handleClose = () => {
        navigate('/');
    };

    return (
        <>
            {/* Hero Banner */}
            <Box sx={{ py: 10, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <Container maxWidth="lg">
                    <GlassCard sx={{ p: { xs: 4, md: 8 }, textAlign: 'center', backdropFilter: 'blur(6px)' }}>
                        <Typography variant="h2" fontWeight="900" sx={{ mb: 2, color: 'text.primary', textShadow: '0 6px 24px rgba(2,6,23,0.6)' }}>
                            Bridge your <Box component="span" sx={{ color: 'primary.main' }}>Education</Box> to your <Box component="span" sx={{ color: 'primary.main' }}>Dream Job</Box>
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}>
                            Analyze your academic history, get AI-powered job predictions, and connect with a community of achievers.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained" size="large" endIcon={<ArrowIcon />}
                                onClick={() => {
                                    if (user) {
                                        if (user.role === 'admin') {
                                            navigate('/admin-dashboard');
                                        } else {
                                            navigate('/dashboard');
                                        }
                                    } else {
                                        navigate('/register');
                                    }
                                }}
                                sx={{ borderRadius: 50, px: 5, py: 2, fontSize: '1.05rem', background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', boxShadow: '0 12px 40px rgba(102,126,234,0.25)' }}
                            >
                                {user ? 'Go to Dashboard' : 'Get Started for Free'}
                            </Button>
                        </Box>
                    </GlassCard>
                </Container>
            </Box>

            {/* Feature Stats */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                    <GlassCard sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ width: 64, height: 64, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                            <TrendingUpIcon fontSize="large" />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">Job Predictor</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            Our ML model matches your CGPA and skills to the best industry roles with 95% accuracy.
                        </Typography>
                        <Button variant="outlined" onClick={() => navigate('/predictor')} sx={{ alignSelf: 'start', borderRadius: 2 }}>
                            Try Predictor
                        </Button>
                    </GlassCard>

                    <GlassCard sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">Placement Trends</Typography>
                            <Chip label="+12% this year" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 2 }}>
                            {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                                <Box key={i} sx={{ flex: 1, bgcolor: i === 5 ? 'primary.main' : 'action.hover', borderRadius: 1, height: `${h}%`, transition: '0.3s', '&:hover': { height: `${h + 10}%`, bgcolor: 'primary.light' } }} />
                            ))}
                        </Box>
                    </GlassCard>
                </Box>
            </Container>

            {/* Community Preview */}
            <Box sx={{ bgcolor: 'background.paper', py: 8, color: 'text.primary' }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" fontWeight="bold" align="center" sx={{ mb: 6 }}>
                        Join our Top Achievers
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' }, gap: 4, justifyContent: 'center' }}>
                        {TOP_STUDENTS.map((student, i) => (
                            <Box key={i}>
                                <Card sx={{ bgcolor: 'background.default', color: 'text.primary', borderRadius: 4, boxShadow: 3 }}>
                                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                                            {student.img}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold">{student.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{student.role}</Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* --- AUTH MODAL (Login / Register) --- */}
            <Dialog
                open={isAuthOpen}
                onClose={handleClose}
                PaperProps={{ sx: { borderRadius: 3, maxWidth: 450, p: 1 } }}
            >
                <DialogContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            {isLogin ? 'Welcome Back' : 'Join Edu2Job'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isLogin ? 'Login to access your dashboard' : 'Create an account to get started'}
                        </Typography>
                    </Box>

                    {isLogin ? <LoginForm /> : <RegisterForm />}

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button
                            size="small"
                            onClick={() => navigate(isLogin ? '/register' : '/login')}
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default HomePage;