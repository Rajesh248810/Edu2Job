import React from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ: React.FC = () => {
    const faqs = [
        {
            question: "How does the Job Predictor work?",
            answer: "Our AI model analyzes your education details (degree, specialization, CGPA) and certifications to predict suitable job roles based on historical hiring trends and industry standards."
        },
        {
            question: "Is the platform free to use?",
            answer: "Yes, Edu2Job is completely free for students. Our goal is to bridge the gap between education and employment."
        },
        {
            question: "How can I update my profile?",
            answer: "You can update your profile by navigating to your Dashboard and clicking on the 'Profile' tab or icon in the sidebar."
        },
        {
            question: "Can I contact support directly?",
            answer: "Yes! Visit our Help Center and use the 'Contact Support' form to submit a ticket. Our team will respond within 24 hours."
        },
        {
            question: "How do I delete my account?",
            answer: "To delete your account, please submit a support ticket with the subject 'Account Deletion Request', and our admin team will process it for you."
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
                    Frequently Asked Questions
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Find answers to common questions about Edu2Job.
                </Typography>
            </Box>

            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {faqs.map((faq, index) => (
                    <Accordion key={index} disableGutters elevation={0} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1" fontWeight="bold">{faq.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography color="text.secondary">
                                {faq.answer}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Container>
    );
};

export default FAQ;
