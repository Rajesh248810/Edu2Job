import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import GlassCard from '../Components/GlassCard';

const TermsOfService: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ mt: 10, mb: 10 }}>
            <GlassCard sx={{ p: 5 }}>
                <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
                    Terms of Service
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" paragraph>
                    Last updated: {new Date().toLocaleDateString()}
                </Typography>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                        1. Acceptance of Terms
                    </Typography>
                    <Typography paragraph>
                        By accessing and using Edu2Job, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </Typography>

                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                        2. Description of Service
                    </Typography>
                    <Typography paragraph>
                        Edu2Job provides users with career prediction tools, educational resources, and job placement data. You are responsible for obtaining access to the Service and that access may involve third party fees (such as Internet service provider or airtime charges).
                    </Typography>

                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                        3. User Conduct
                    </Typography>
                    <Typography paragraph>
                        You agree to use the website only for lawful purposes. You are prohibited from posting on or transmitting through the website any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, sexually explicit, profane, hateful, racially, ethnically, or otherwise objectionable.
                    </Typography>

                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                        4. Intellectual Property
                    </Typography>
                    <Typography paragraph>
                        All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Edu2Job or its content suppliers and protected by international copyright laws.
                    </Typography>

                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                        5. Termination
                    </Typography>
                    <Typography paragraph>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </Typography>

                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                        6. Changes to Terms
                    </Typography>
                    <Typography paragraph>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                    </Typography>
                </Box>
            </GlassCard>
        </Container>
    );
};

export default TermsOfService;
