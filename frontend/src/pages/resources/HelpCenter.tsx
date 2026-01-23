import React, { useState } from 'react';
import { Box, Container, Typography, Paper, TextField, Button, Alert, Card, CardContent } from '@mui/material';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ArticleIcon from '@mui/icons-material/Article';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FeedIcon from '@mui/icons-material/Feed';
import { useNavigate } from 'react-router-dom';
import SEO from '../../Components/SEO';

const HelpCenter: React.FC = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setStatus({ type: 'error', text: 'You must be logged in to submit a ticket.' });
            return;
        }
        setLoading(true);
        setStatus(null);

        try {
            await axios.post(
                `${API_BASE_URL}/api/support-tickets/`,
                { user_id: user.user_id, subject, message },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus({ type: 'success', text: 'Ticket submitted successfully! We will contact you soon.' });
            setSubject('');
            setMessage('');
        } catch (err) {
            setStatus({ type: 'error', text: 'Failed to submit ticket. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const FeatureCard = ({ icon, title, desc, path }: { icon: any, title: string, desc: string, path: string }) => (
        <Card
            sx={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}
            onClick={() => navigate(path)}
        >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>{icon}</Box>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Typography variant="body2" color="text.secondary">{desc}</Typography>
            </CardContent>
        </Card>
    );

    const MyTickets = ({ token, user_id }: { token: string | null, user_id: number }) => {
        const [tickets, setTickets] = React.useState<any[]>([]);
        const navigate = useNavigate();

        React.useEffect(() => {
            if (token) {
                axios.get(`${API_BASE_URL}/api/support-tickets/?user_id=${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => setTickets(res.data))
                    .catch(err => console.error(err));
            }
        }, [token, user_id]);

        if (tickets.length === 0) return (
            <Alert severity="info" sx={{ mb: 2 }}>You haven't submitted any tickets yet.</Alert>
        );

        return (
            <Box sx={{ display: 'grid', gap: 2 }}>
                {tickets.map((t) => (
                    <Paper
                        key={t.ticket_id}
                        sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                    >
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">#{t.ticket_id}: {t.subject}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(t.created_at).toLocaleDateString()}</Typography>
                        </Box>
                        <Alert
                            severity={t.status === 'Resolved' ? 'success' : t.status === 'In Progress' ? 'warning' : 'info'}
                            icon={false}
                            sx={{ py: 0, px: 1, '.MuiAlert-message': { p: 0 } }}
                        >
                            {t.status}
                        </Alert>
                    </Paper>
                ))}
            </Box>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <SEO
                title="Help Center - Edu2Job | Support & Documentation"
                description="Find answers to common questions, browse documentation, read our blog, or contact support. Edu2Job Help Center is here to assist you."
                url="https://edu2job.online/help-center"
            />
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    How can we help you?
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Find answers, read our documentation, or get in touch with our team.
                </Typography>
            </Box>

            {/* Resources Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 8 }}>
                <Box>
                    <FeatureCard
                        icon={<QuestionAnswerIcon fontSize="large" />}
                        title="FAQs"
                        desc="Common questions answered immediately."
                        path="/faq"
                    />
                </Box>
                <Box>
                    <FeatureCard
                        icon={<ArticleIcon fontSize="large" />}
                        title="Documentation"
                        desc="Detailed guides on using the platform."
                        path="/documentation"
                    />
                </Box>
                <Box>
                    <FeatureCard
                        icon={<FeedIcon fontSize="large" />}
                        title="Blog"
                        desc="Latest news, tips, and career advice."
                        path="/blog"
                    />
                </Box>
            </Box>

            {/* My Tickets Section */}
            {user && (
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        My Support Tickets
                    </Typography>
                    <MyTickets token={token} user_id={user.user_id} />
                </Box>
            )}

            {/* Contact Form */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ mb: 2 }}>
                            <SupportAgentIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Contact Support
                        </Typography>
                        <Typography color="text.secondary" paragraph>
                            Can't find what you're looking for? Reach out to <strong>Rajesh Sahoo</strong> directly or submit a ticket below.
                        </Typography>
                        <Typography variant="body1" color="primary" sx={{ mb: 2, fontWeight: 'medium' }}>
                            Email: support@edu2job.online
                        </Typography>
                        <Typography color="text.secondary" paragraph>
                            Our support team will get back to you within 24 hours.
                        </Typography>
                    </Box>
                    <Box>
                        {status && (
                            <Alert severity={status.type} sx={{ mb: 3 }}>
                                {status.text}
                            </Alert>
                        )}
                        <form onSubmit={handleSubmitTicket}>
                            <TextField
                                fullWidth
                                label="Subject"
                                variant="outlined"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                            />
                            <TextField
                                fullWidth
                                label="Message"
                                variant="outlined"
                                multiline
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                            >
                                {loading ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </form>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default HelpCenter;
