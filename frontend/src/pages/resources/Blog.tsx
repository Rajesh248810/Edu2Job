import React, { useEffect, useState } from 'react';
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
            <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
                    Edu2Job Blog
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Insights, career advice, and industry trends.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
                {posts.map((post) => (
                    <Card key={post.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
                        <CardMedia
                            component="img"
                            height="200"
                            image={post.image_url}
                            alt={post.title}
                            sx={{ bgcolor: 'grey.200' }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                <Chip label={post.category} size="small" color="primary" variant="outlined" />
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </Typography>
                            </Box>
                            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
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
