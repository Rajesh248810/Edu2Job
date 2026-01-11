import React from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Button, Chip } from '@mui/material';

const blogPosts = [
    {
        id: 1,
        title: "Top 10 Emerging Tech Jobs in 2026",
        excerpt: "Discover the most in-demand roles in the technology sector and what skills you need to land them.",
        category: "Career Trends",
        image: "https://source.unsplash.com/random/800x600/?technology,office",
        date: "Jan 10, 2026"
    },
    {
        id: 2,
        title: "How to Build a Resume that Stands Out",
        excerpt: "Learn the secrets to creating a resume that passes ATS scanners and catches recruiters' eyes.",
        category: "Career Advice",
        image: "https://source.unsplash.com/random/800x600/?resume,writing",
        date: "Dec 15, 2025"
    },
    {
        id: 3,
        title: "The Importance of Continuous Learning",
        excerpt: "Why certifications and lifelong learning are your best assets in a rapidly changing job market.",
        category: "Personal Growth",
        image: "https://source.unsplash.com/random/800x600/?learning,library",
        date: "Nov 28, 2025"
    }
];

const Blog: React.FC = () => {
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

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
                {blogPosts.map((post) => (
                    <Card key={post.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
                        <CardMedia
                            component="img"
                            height="200"
                            image={post.image}
                            alt={post.title}
                            sx={{ bgcolor: 'grey.200' }} // Fallback color
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                <Chip label={post.category} size="small" color="primary" variant="outlined" />
                                <Typography variant="caption" color="text.secondary">{post.date}</Typography>
                            </Box>
                            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                                {post.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {post.excerpt}
                            </Typography>
                            <Button size="small" color="primary" sx={{ mt: 'auto' }}>
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
