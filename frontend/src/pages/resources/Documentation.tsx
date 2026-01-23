import React from 'react';
import { Box, Container, Typography, Paper, List, ListItemButton, ListItemText, ListItemIcon, Divider } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SEO from '../../Components/SEO';

const Documentation: React.FC = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <SEO
                title="Documentation - Edu2Job"
                description="Browse detailed guides and resources to get the most out of Edu2Job's career prediction and resume building tools."
                url="https://edu2job.online/documentation"
            />
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
                    Documentation
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Guides and resources to help you get the most out of Edu2Job.
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ArticleIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h5" fontWeight="bold">Getting Started</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                        <ListItemButton>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Creating a Student Account" secondary="Learn how to sign up and verify your email." />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Setting up your Profile" secondary="Complete your education and certification details." />
                        </ListItemButton>
                    </List>
                </Paper>

                <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ArticleIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="h5" fontWeight="bold">Job Predictor</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                        <ListItemButton>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Understanding Predictions" secondary="How our AI matches your skills to jobs." />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Improving your Score" secondary="Tips to get better job recommendations." />
                        </ListItemButton>
                    </List>
                </Paper>
            </Box>
        </Container>
    );
};

export default Documentation;
