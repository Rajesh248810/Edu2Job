import React from 'react';
import { Container, Box, Typography, Avatar, Button, Grid, Chip, Divider } from '@mui/material';
import GlassCard from '../Components/GlassCard';
import SEO from '../Components/SEO';
import {
    LinkedIn as LinkedInIcon,
    GitHub as GitHubIcon,
    Email as EmailIcon,
    Facebook as FacebookIcon,
    Code as CodeIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';

const AboutUs: React.FC = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <SEO
                title="About Us - Edu2Job | Meet the Team"
                description="Meet Gyanaranjan Sahoo, the CEO & Founder of Edu2Job. We are bridging the gap between education and employment using AI."
                url="https://edu2job.online/about-us"
            />
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "Edu2Job",
                    "url": "https://edu2job.online",
                    "logo": "https://edu2job.online/assets/logo.svg",
                    "founder": {
                        "@type": "Person",
                        "name": "Gyanaranjan Sahoo",
                        "jobTitle": "CEO & Founder",
                        "url": "https://linkedin.com/in/gyanaranjan-sahoo-596998217/",
                        "sameAs": [
                            "https://github.com/Rajesh248810",
                            "https://linkedin.com/in/gyanaranjan-sahoo-596998217/"
                        ]
                    },
                    "sameAs": [
                        "https://github.com/Rajesh248810",
                        "https://linkedin.com/in/gyanaranjan-sahoo-596998217/"
                    ]
                })}
            </script>

            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Typography variant="h2" component="h1" fontWeight="900" sx={{
                    mb: 2,
                    background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    About Edu2Job
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
                    Empowering students with AI-driven insights to bridge the gap between academic achievements and professional success.
                </Typography>
            </Box>

            <Grid container spacing={6} alignItems="center">
                {/* Vision/Developer Note Section */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <GlassCard sx={{ p: 5, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <CodeIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                            <Typography variant="h4" fontWeight="bold">
                                Developer's Vision
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                            "In today's rapidly evolving tech landscape, the disconnect between academic curricula and industry requirements is a growing challenge.
                            <b> Edu2Job</b> was born from a vision to eliminate this uncertainty."
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                            "As a professional industrial developer, my goal was to build a platform that doesn't just analyze numbers but understands potential.
                            We leverage advanced Machine Learning models to predict career paths with high accuracy, ensuring every student finds their rightful place in the workforce."
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, fontStyle: 'italic', color: 'text.secondary' }}>
                            — Building the future, one prediction at a time.
                        </Typography>
                    </GlassCard>
                </Grid>

                {/* CEO Profile Card */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <GlassCard sx={{
                        p: 4,
                        textAlign: 'center',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
                        position: 'relative',
                        overflow: 'visible'
                    }}>
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                            <Avatar
                                src="/assets/images/ceo_profile.png"
                                alt="Gyanaranjan Sahoo"
                                sx={{
                                    width: 180,
                                    height: 180,
                                    mx: 'auto',
                                    border: '4px solid white',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                }}
                            />
                            <Chip
                                icon={<VerifiedIcon sx={{ fontSize: '1rem !important', color: 'white !important' }} />}
                                label="CEO & Founder"
                                sx={{
                                    position: 'absolute',
                                    bottom: 10,
                                    right: -10,
                                    bgcolor: '#2196F3',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    boxShadow: 2
                                }}
                            />
                        </Box>

                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Gyanaranjan Sahoo
                        </Typography>
                        <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                            Lead Developer & Visionary
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Full Stack Developer | AI Enthusiast | Tech Innovator
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<EmailIcon />}
                                href="mailto:support@edu2job.online"
                                sx={{ borderRadius: 50, px: 3, bgcolor: '#EA4335', '&:hover': { bgcolor: '#c33529' } }}
                            >
                                Email
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<LinkedInIcon />}
                                href="https://linkedin.com/in/gyanaranjan-sahoo-596998217/"
                                target="_blank"
                                sx={{ borderRadius: 50, px: 3, bgcolor: '#0077b5', '&:hover': { bgcolor: '#005885' } }}
                            >
                                LinkedIn
                            </Button>
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button
                                size="small"
                                startIcon={<GitHubIcon />}
                                href="https://github.com/Rajesh248810"
                                target="_blank"
                                sx={{ color: '#333' }}
                            >
                                GitHub
                            </Button>
                            <Button
                                size="small"
                                startIcon={<FacebookIcon />}
                                href="https://facebook.com"
                                target="_blank"
                                sx={{ color: '#1877F2' }}
                            >
                                Facebook
                            </Button>
                        </Box>
                    </GlassCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AboutUs;
