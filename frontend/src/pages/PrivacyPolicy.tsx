import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import GlassCard from '../Components/GlassCard';

const PrivacyPolicy: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ mt: 10, mb: 10 }}>
            <GlassCard sx={{ p: 5 }}>
                <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
                    Privacy Policy
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" paragraph>
                    Last updated: {new Date().toLocaleDateString()}
                </Typography>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                        1. Introduction
                    </Typography>
                    <Typography paragraph>
                        Welcome to Edu2Job. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                    </Typography>

                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                        2. Data We Collect
                    </Typography>
                    <Typography paragraph>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </Typography>
                    <ul>
                        <li><Typography><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</Typography></li>
                        <li><Typography><strong>Contact Data</strong> includes email address and telephone numbers.</Typography></li>
                        <li><Typography><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</Typography></li>
                        <li><Typography><strong>Profile Data</strong> includes your username and password, your education history, skills, and certifications.</Typography></li>
                    </ul>

                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                        3. How We Use Your Data
                    </Typography>
                    <Typography paragraph>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </Typography>
                    <ul>
                        <li><Typography>To provide the career prediction services you have requested.</Typography></li>
                        <li><Typography>To manage your account and registration.</Typography></li>
                        <li><Typography>To improve our website, products/services, marketing or customer relationships.</Typography></li>
                    </ul>

                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                        4. Data Security
                    </Typography>
                    <Typography paragraph>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                    </Typography>

                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                        5. Contact Us
                    </Typography>
                    <Typography paragraph>
                        If you have any questions about this privacy policy or our privacy practices, please contact us at support@edu2job.com.
                    </Typography>
                </Box>
            </GlassCard>
        </Container>
    );
};

export default PrivacyPolicy;
