import React, { useEffect, useState } from 'react';
import SEO from '../../Components/SEO';
import { Box, Container, Typography, Card, CardContent, CardMedia, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    image_url: string;
    created_at: string;
}

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Ensure URL ends with / to avoid 301 Redirects
                const response = await api.get('/api/blog/');
                setPosts(response.data);
            } catch (err) {
                console.error("Failed to fetch blog posts", err);
                setError("Unable to load latest articles.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleReadMore = (slug: string) => {
        navigate(`/blog/${slug}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }
    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <SEO
                title="Edu2Job Insights - Blog"
                description="Read expert perspectives on the future of work, AI, and career development."
                url="https://edu2job.online/blog"
            />
            {/* Hero Section */}
            <Box sx={{
                textAlign: 'center',
                mb: 8,
                py: 8,
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <Typography variant="h2" component="h1" fontWeight="800" sx={{ mb: 2, letterSpacing: '-0.025em' }}>
                    Edu2Job Insights
                </Typography>
                <Typography variant="h5" sx={{ color: 'grey.300', maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                    Expert perspectives on the future of work, AI, and career development.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
                {posts.map((post) => (
                    <Card key={post.id} sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        },
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'grey.200'
                    }}>
                        <CardMedia
                            component="img"
                            height="200"
                            image={post.image_url}
                            alt={post.title}
                            sx={{ bgcolor: 'grey.200' }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                <Chip
                                    label={post.category}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        fontSize: '0.75rem'
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Typography>
                            </Box>
                            <Typography variant="h6" component="h2" gutterBottom fontWeight="700" sx={{ lineHeight: 1.3, mb: 1.5 }}>
                                {post.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {post.excerpt}
                            </Typography>
                            <Button
                                size="small"
                                color="primary"
                                sx={{ mt: 'auto' }}
                                onClick={() => handleReadMore(post.slug)}
                            >
                                Read More
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Container>
    );
};

export default Blog;
