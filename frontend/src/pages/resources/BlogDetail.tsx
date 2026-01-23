import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Chip, Button, CircularProgress, Alert, Avatar, Divider } from '@mui/material';
import { ArrowBack, Schedule } from '@mui/icons-material';
import api from '../../api';
import SEO from '../../Components/SEO';

interface BlogPost {
    id: number;
    title: string;
    content: string;
    image_url: string;
    category: string;
    author: string;
    created_at: string;
    excerpt?: string; // Add optional excerpt if API returns it, or derive from content
}

const BlogDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/api/blog/${slug}/`);
                setPost(response.data);
            } catch (err) {
                console.error("Failed to fetch blog post", err);
                setError("Article not found.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPost();
    }, [slug]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (error || !post) return <Container sx={{ mt: 10 }}><Alert severity="error">{error || "Post not found"}</Alert></Container>;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <SEO
                title={`${post.title} - Edu2Job Blog`}
                description={post.excerpt || `Read ${post.title} on Edu2Job Insights.`}
                url={`https://edu2job.online/blog/${slug}`}
                type="article"
            />
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/blog')} sx={{ mb: 3 }}>
                Back to Blog
            </Button>

            <Chip label={post.category} color="primary" sx={{ mb: 2 }} />

            <Typography variant="h3" fontWeight="800" component="h1" gutterBottom>
                {post.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.light' }}>{post.author.charAt(0)}</Avatar>
                    <Typography variant="body2">{post.author}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Schedule fontSize="small" />
                    <Typography variant="body2">
                        {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                </Box>
            </Box>

            <Box
                component="img"
                src={post.image_url}
                alt={post.title}
                sx={{ width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: 4, mb: 5 }}
            />

            <Box sx={{ typography: 'body1', fontSize: '1.2rem', lineHeight: 1.8 }}>
                {/* 
                   WARNING: Using dangerouslySetInnerHTML. 
                   Ensure backend sanitizes content if user-generated content is ever allowed. 
                   Since this is admin-only content for now, it's acceptable.
                */}
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </Box>
        </Container>
    );
};

export default BlogDetail;
