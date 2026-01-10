
import React, { useState, useEffect } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    Rating,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../api';
import { API_BASE_URL } from '../config';

interface FeedbackData {
    feedback_id: number;
    user_name: string;
    user_email: string;
    rating: number;
    comments: string;
    created_at: string;
    predicted_role: string;
    prediction_id: number;
}

const FeedbackTable: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const res = await api.get(`${API_BASE_URL}/api/admin/feedback/`, {
                params: { search: searchQuery }
            });
            setFeedbacks(res.data);
            setError('');
        } catch (err) {
            console.error("Failed to fetch feedback", err);
            setError("Failed to fetch feedback data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchFeedback();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const parseComments = (fullComment: string) => {
        // Extract tags if present [Tags: ...]
        const tagMatch = fullComment.match(/\[Tags: (.*?)\]/);
        const tags = tagMatch ? tagMatch[1].split(', ') : [];
        const actualComment = fullComment.replace(/\[Tags: .*?\]/, '').trim();

        return { tags, actualComment };
    };

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">User Feedback</Typography>
                <TextField
                    size="small"
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Role Predicted</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Feedback Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && feedbacks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : feedbacks.length > 0 ? (
                            feedbacks.map((item) => {
                                const { tags, actualComment } = parseComments(item.comments);
                                return (
                                    <TableRow key={item.feedback_id} hover>
                                        <TableCell sx={{ minWidth: 120 }}>
                                            <Typography variant="body2">{formatDate(item.created_at)}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight="bold">{item.user_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{item.user_email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={item.predicted_role} size="small" color="primary" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Rating value={item.rating} readOnly size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                {tags.length > 0 && (
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
                                                        {tags.map((tag, idx) => (
                                                            <Chip
                                                                key={idx}
                                                                label={tag}
                                                                size="small"
                                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                                                color={item.rating >= 4 ? 'success' : item.rating <= 2 ? 'error' : 'default'}
                                                                variant="filled"
                                                            />
                                                        ))}
                                                    </Box>
                                                )}
                                                {actualComment && (
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        "{actualComment}"
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No feedback found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default FeedbackTable;
