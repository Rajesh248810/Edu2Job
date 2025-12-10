import React, { useEffect, useState } from 'react';
import {
    Container, Card, CardContent, Typography, Avatar,
    Box, Button, TextField, InputAdornment, CircularProgress, Alert, Chip, Pagination
} from '@mui/material';
import { Search as SearchIcon, ArrowBack as ArrowBackIcon, History as HistoryIcon, Star as StarIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface User {
    user_id: number;
    name: string;
    role: string;
    education: { university: string }[];
    placements: { role: string; company: string }[];
    profile_picture?: string;
}

const CommunityPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [recentUsers, setRecentUsers] = useState<User[]>([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const USERS_PER_PAGE = 9;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/users/`);
                setUsers(response.data);
            } catch (err) {
                console.error('Failed to fetch users:', err);
                setError('Failed to load community members.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Load recent users from local storage whenever 'users' changes
    useEffect(() => {
        if (users.length > 0) {
            const storedRecentIds = JSON.parse(localStorage.getItem('recent_viewed_users') || '[]');
            const recent = users.filter(u => storedRecentIds.includes(u.user_id));
            recent.sort((a, b) => storedRecentIds.indexOf(a.user_id) - storedRecentIds.indexOf(b.user_id));
            setRecentUsers(recent);
        }
    }, [users]);

    // Reset page when search term changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleViewProfile = (userId: number) => {
        const storedRecentIds = JSON.parse(localStorage.getItem('recent_viewed_users') || '[]');
        const newIds = [userId, ...storedRecentIds.filter((id: number) => id !== userId)].slice(0, 5);
        localStorage.setItem('recent_viewed_users', JSON.stringify(newIds));
        navigate(`/profile/${userId}`);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    };

    const featuredUsers = users.slice(0, 3);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.education?.[0]?.university || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const UserCard = ({ user, featured = false }: { user: User, featured?: boolean }) => (
        <Card sx={{
            borderRadius: 3,
            transition: '0.3s',
            '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: featured ? '1px solid #ffd700' : 'none',
            position: 'relative'
        }}>
            {featured && (
                <Chip
                    icon={<StarIcon sx={{ fontSize: '1rem !important' }} />}
                    label="Top Achiever"
                    color="warning"
                    size="small"
                    sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 'bold' }}
                />
            )}
            {/* Placement Badge */}
            {user.placements && user.placements.length > 0 && (
                <Chip
                    label="Placed"
                    color="success"
                    size="small"
                    icon={<VerifiedIcon sx={{ fontSize: '1rem !important' }} />}
                    sx={{ position: 'absolute', top: 10, left: 10, fontWeight: 'bold', height: 24 }}
                />
            )}
            <CardContent sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                    src={user.profile_picture ? `${API_BASE_URL}${user.profile_picture}` : undefined}
                    sx={{ width: 80, height: 80, mb: 2, bgcolor: featured ? 'warning.light' : 'primary.light', color: featured ? 'warning.dark' : 'primary.main', fontSize: '1.5rem', fontWeight: 'bold' }}
                >
                    {getInitials(user.name)}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">{user.name}</Typography>
                <Typography variant="body2" color="primary" gutterBottom>{user.role}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    {user.education?.[0]?.university ? `📍 ${user.education[0].university}` : 'No University Info'}
                </Typography>
                <Box sx={{ mt: 'auto', width: '100%' }}>
                    <Button
                        variant={featured ? "contained" : "outlined"}
                        color={featured ? "warning" : "primary"}
                        fullWidth
                        sx={{ borderRadius: 20 }}
                        onClick={() => handleViewProfile(user.user_id)}
                    >
                        View Profile
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );

    // Helper to render paginated grid
    const renderPaginatedGrid = (data: User[]) => {
        const count = Math.ceil(data.length / USERS_PER_PAGE);
        const paginatedData = data.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

        return (
            <>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                    {paginatedData.map((user) => (
                        <Box key={user.user_id}>
                            <UserCard user={user} />
                        </Box>
                    ))}
                </Box>
                {count > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                        <Pagination
                            count={count}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
                Back to Dashboard
            </Button>

            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                    Community
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Connect with students and alumni from other universities.
                </Typography>
            </Box>

            <Box sx={{ maxWidth: 600, mx: 'auto', mb: 5 }}>
                <TextField
                    fullWidth
                    placeholder="Search by name, university, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
            ) : (
                <>
                    {/* If searching, show only results (Paginated) */}
                    {searchTerm ? (
                        <>
                            {filteredUsers.length > 0 ? (
                                renderPaginatedGrid(filteredUsers)
                            ) : (
                                <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                                    No users found matching "{searchTerm}"
                                </Typography>
                            )}
                        </>
                    ) : (
                        // Default View: Featured + Recent + All (Paginated)
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

                            {/* Featured Section */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <StarIcon color="warning" sx={{ mr: 1 }} />
                                    <Typography variant="h5" fontWeight="bold">Top Achievers</Typography>
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                                    {featuredUsers.map((user) => (
                                        <Box key={user.user_id}>
                                            <UserCard user={user} featured={true} />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Recently Viewed Section */}
                            {recentUsers.length > 0 && (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <HistoryIcon color="action" sx={{ mr: 1 }} />
                                        <Typography variant="h5" fontWeight="bold">Recently Viewed</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', overflowX: 'auto', gap: 3, pb: 2 }}>
                                        {recentUsers.map((user) => (
                                            <Box key={user.user_id} sx={{ minWidth: 280, maxWidth: 300 }}>
                                                <UserCard user={user} />
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* All Users Section (Paginated) */}
                            <Box>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>All Members</Typography>
                                {renderPaginatedGrid(users)}
                            </Box>
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default CommunityPage;