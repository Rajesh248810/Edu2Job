import React, { useEffect, useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Divider,
    Tabs,
    Tab,
    CircularProgress,
    Menu,
    MenuItem,
    Select,
    FormControl,
    useTheme,
    alpha,
    Dialog,
    DialogTitle,
    Alert,
    useMediaQuery,
    TextField,
    InputAdornment,
    Avatar,
    LinearProgress,
    Checkbox
} from '@mui/material';
import {
    ExitToApp as LogoutIcon,
    Delete as DeleteIcon,
    People as PeopleIcon,
    HealthAndSafety as HealthIcon,
    PendingActions as PendingIcon,
    CloudUpload as UploadIcon,
    Refresh as RefreshIcon,
    Security as SecurityIcon,
    Psychology as ModelIcon,
    Assessment as AssessmentIcon,
    Analytics as AnalyticsIcon,
    Brightness4 as MoonIcon,
    Brightness7 as SunIcon,
    Menu as MenuIcon,
    Search as SearchIcon,
    Visibility as ViewIcon,
    School as SchoolIcon,
    Verified as VerifiedIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useThemeContext } from '../theme/ThemeContext';
import api from '../api';
import { API_BASE_URL } from '../config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GlassCard from '../Components/GlassCard';

// --- Types ---
interface UserData {
    user_id: number;
    name: string;
    email: string;
    role: string;
}

interface LogData {
    log_id: number;
    action_type: string;
    timestamp: string;
    admin__name: string;
    target_user__name: string;
}

interface StudentDetail {
    user_id: number;
    name: string;
    email: string;
    university: string;
    degree: string;
}

interface AnalyticsData {
    total_users: number;
    students_count: number;
    university_distribution: { name: string; value: number }[];
    job_trends: { name: string; count: number }[];
    system_health: string;
    pending_reviews: number;
    training_stats?: {
        total: number;
        trained: number;
    };
}

interface Education {
    university: string;
    degree: string;
    specialization: string;
    cgpa: string;
    year_of_completion: number;
}

interface Certification {
    cert_name: string;
    issuing_organization: string;
    issue_date: string;
}

interface UserProfile {
    user_id: number;
    name: string;
    role: string;
    email: string;
    education: Education[];
    certifications: Certification[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { mode, toggleTheme } = useThemeContext();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isTraining, setIsTraining] = useState(false);

    // Mobile Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Data States
    const [users, setUsers] = useState<UserData[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [logs, setLogs] = useState<LogData[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Model Management State
    const [file, setFile] = useState<File | null>(null);

    // University Drill-down State
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categoryStudents, setCategoryStudents] = useState<StudentDetail[]>([]);

    // Log Management State
    const [logSearchQuery, setLogSearchQuery] = useState('');
    const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);

    // Profile View State
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
        } else {
            fetchAnalytics(); // Load initial data
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get(`${API_BASE_URL}/api/admin/analytics/`);
            setAnalytics(res.data);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`${API_BASE_URL}/api/admin/users/`, {
                params: { search: searchQuery }
            });
            setUsers(res.data);
        } catch (err) {
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        // Don't set loading true here to avoid flickering on auto-refresh
        try {
            const res = await api.get(`${API_BASE_URL}/api/admin/logs/`, {
                params: { search: logSearchQuery }
            });
            const logsData = res.data;
            setLogs(logsData);

            // Check for recent completion or active training
            const recentLog = logsData[0]; // Assuming sorted by latest

            if (recentLog) {
                if (recentLog.action_type === 'TRAINING_STARTED') {
                    setIsTraining(true);
                } else if (recentLog.action_type === 'TRAINING_COMPLETED') {
                    if (isTraining) {
                        setIsTraining(false);
                        setSuccessMsg("Model training completed successfully!");
                        fetchAnalytics();
                    } else if (new Date(recentLog.timestamp).getTime() > Date.now() - 60000) {
                        // Just in case we missed the transition but it's recent
                        // setSuccessMsg("Model training completed successfully!"); // Optional: avoid spamming if already seen
                        fetchAnalytics();
                    }
                } else if (recentLog.action_type === 'TRAINING_FAILED') {
                    if (isTraining) {
                        setIsTraining(false);
                        setError("Model training failed. Check logs for details.");
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch logs");
        }
    };

    // Auto-refresh logs every 5 seconds if on Logs tab or Model tab
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (tabValue === 2 || tabValue === 3) { // Model Governance or System Logs
            fetchLogs(); // Initial fetch
            interval = setInterval(fetchLogs, 5000);
        }
        return () => clearInterval(interval);
    }, [tabValue]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError('');
        setSuccessMsg('');
        if (newValue === 1) fetchUsers();
        if (newValue === 3) fetchLogs();
        if (newValue === 0) fetchAnalytics();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMobileMenuClick = (newValue: number) => {
        handleTabChange({} as React.SyntheticEvent, newValue);
        handleMenuClose();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- User Management Actions ---
    const handleDeleteUser = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`${API_BASE_URL}/api/admin/users/${id}/`);
                setUsers(users.filter(u => u.user_id !== id));
                setSuccessMsg("User deleted successfully");
            } catch (err) {
                setError("Failed to delete user");
            }
        }
    };

    const handleRoleChange = async (id: number, newRole: string) => {
        try {
            await api.patch(`${API_BASE_URL}/api/admin/users/${id}/`, { role: newRole });
            setUsers(users.map(u => u.user_id === id ? { ...u, role: newRole } : u));
            setSuccessMsg("User role updated");
        } catch (err) {
            setError("Failed to update role");
        }
    };

    const handleSelectUser = (id: number) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(selectedUserIds.filter(userId => userId !== id));
        } else {
            setSelectedUserIds([...selectedUserIds, id]);
        }
    };

    const handleSelectAllUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedUserIds(users.map(u => u.user_id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleDeleteUsers = async () => {
        if (selectedUserIds.length === 0) return;

        if (window.confirm(`Are you sure you want to delete ${selectedUserIds.length} users?`)) {
            try {
                await api.delete(`${API_BASE_URL}/api/admin/users/`, { data: { user_ids: selectedUserIds } });
                setSuccessMsg("Users deleted successfully");
                setSelectedUserIds([]);
                fetchUsers();
            } catch (err) {
                console.error("Failed to delete users", err);
                setError("Failed to delete users");
            }
        }
    };

    // --- Model Management Actions ---
    const handleFileUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            await api.post(`${API_BASE_URL}/api/admin/model/upload/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMsg("Training data uploaded successfully");
            setFile(null);
        } catch (err) {
            setError("Failed to upload file");
        } finally {
            setLoading(false);
        }
    };

    const handleRetrain = async () => {
        setLoading(true);
        try {
            const res = await api.post(`${API_BASE_URL}/api/admin/model/retrain/`);
            setSuccessMsg(res.data.message || "Model retraining triggered successfully");
            setIsTraining(true); // Optimistically set training state
            // Immediately fetch logs to confirm start
            setTimeout(fetchLogs, 1000);
        } catch (err) {
            setError("Failed to trigger retraining");
        } finally {
            setLoading(false);
        }
    };

    const handlePieClick = async (data: any) => {
        if (!data || !data.name) return;
        const category = data.name;
        setSelectedCategory(category);
        setOpenDialog(true);

        try {
            const res = await api.get(`${API_BASE_URL}/api/admin/analytics/university/${category}/`);
            setCategoryStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch category details", err);
            setCategoryStudents([]);
        }
    };

    const handleViewProfile = async (id: number) => {
        setOpenDialog(false); // Close the dialog
        setSelectedStudentId(id);
        setLoading(true);
        try {
            const response = await api.get(`${API_BASE_URL}/api/users/${id}/`);
            setStudentProfile(response.data);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load user profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToDashboard = () => {
        setSelectedStudentId(null);
        setStudentProfile(null);
    };

    // --- Log Management Actions ---
    const handleLogSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLogSearchQuery(e.target.value);
    };

    // Trigger search when query changes (debounced ideally, but simple effect for now)
    useEffect(() => {
        if (tabValue === 3) {
            const timeoutId = setTimeout(() => {
                fetchLogs();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [logSearchQuery]);

    const handleSelectLog = (id: number) => {
        if (selectedLogIds.includes(id)) {
            setSelectedLogIds(selectedLogIds.filter(logId => logId !== id));
        } else {
            setSelectedLogIds([...selectedLogIds, id]);
        }
    };

    const handleSelectAllLogs = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedLogIds(logs.map(log => log.log_id));
        } else {
            setSelectedLogIds([]);
        }
    };

    const handleDeleteLogs = async () => {
        if (selectedLogIds.length === 0) return;

        if (window.confirm(`Are you sure you want to delete ${selectedLogIds.length} logs?`)) {
            try {
                await api.delete(`${API_BASE_URL}/api/admin/logs/`, { data: { log_ids: selectedLogIds } });
                setSuccessMsg("Logs deleted successfully");
                setSelectedLogIds([]);
                fetchLogs();
            } catch (err) {
                console.error("Failed to delete logs", err);
                setError("Failed to delete logs");
            }
        }
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    };



    if (!user) return null;

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <AppBar position="static" color="primary" elevation={0}>
                <Toolbar>
                    {isMobile && !selectedStudentId && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={handleMenuOpen}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Edu2Job Admin Panel
                    </Typography>
                    {!isMobile && (
                        <Typography variant="body1" sx={{ mr: 2 }}>
                            Welcome, {user.name}
                        </Typography>
                    )}
                    <IconButton sx={{ ml: 1, mr: 2 }} onClick={toggleTheme} color="inherit">
                        {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </IconButton>
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Mobile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleMobileMenuClick(0)}>Analytics</MenuItem>
                <MenuItem onClick={() => handleMobileMenuClick(1)}>User Management</MenuItem>
                <MenuItem onClick={() => handleMobileMenuClick(2)}>Model Governance</MenuItem>
                <MenuItem onClick={() => handleMobileMenuClick(3)}>System Logs</MenuItem>
            </Menu>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>

                {/* --- PROFILE VIEW --- */}
                {selectedStudentId && studentProfile ? (
                    <Box>
                        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToDashboard} sx={{ mb: 2 }}>
                            Back to Dashboard
                        </Button>

                        {/* Header Card */}
                        <GlassCard sx={{ p: 4, mb: 4, borderRadius: 4, textAlign: 'center' }} elevation={6}>
                            <Avatar
                                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}
                            >
                                {getInitials(studentProfile.name)}
                            </Avatar>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>{studentProfile.name}</Typography>
                            <Typography variant="h6" color="text.secondary" gutterBottom>{studentProfile.role}</Typography>
                            <Typography variant="body1" color="text.secondary">{studentProfile.email}</Typography>
                        </GlassCard>

                        {/* Details Grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

                            {/* Education Section */}
                            <GlassCard sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(102,126,234,0.14)', color: 'primary.main', mr: 2 }}><SchoolIcon /></Avatar>
                                    <Typography variant="h6" fontWeight="bold">Academic Profile</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                {studentProfile.education?.length ? (
                                    studentProfile.education.map((edu, index) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">{edu.university}</Typography>
                                            <Typography variant="body2" color="text.secondary">{edu.degree} in {edu.specialization}</Typography>
                                            <Typography variant="body2" color="text.secondary">Class of {edu.year_of_completion}</Typography>
                                            <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>CGPA: {edu.cgpa}</Typography>
                                            {index < studentProfile.education.length - 1 && <Divider sx={{ my: 2 }} />}
                                        </Box>
                                    ))
                                ) : (
                                    <Typography color="text.secondary">No education details available.</Typography>
                                )}
                            </GlassCard>

                            {/* Certifications Section */}
                            <GlassCard sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(199, 102, 214, 0.12)', color: 'secondary.main', mr: 2 }}><VerifiedIcon /></Avatar>
                                    <Typography variant="h6" fontWeight="bold">Certifications</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                {studentProfile.certifications?.length ? (
                                    studentProfile.certifications.map((cert, i) => (
                                        <Box key={i} sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">{cert.cert_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">Issued by {cert.issuing_organization}</Typography>
                                            <Typography variant="caption" display="block" color="text.secondary">Date: {cert.issue_date}</Typography>
                                            {i < studentProfile.certifications.length - 1 && <Divider sx={{ my: 1 }} />}
                                        </Box>
                                    ))
                                ) : (
                                    <Typography color="text.secondary">No certifications available.</Typography>
                                )}
                            </GlassCard>

                        </Box>
                    </Box>
                ) : (
                    <>
                        {/* Desktop Tabs */}
                        {!isMobile && (
                            <Paper sx={{ mb: 3 }}>
                                <Tabs value={tabValue} onChange={handleTabChange} centered indicatorColor="primary" textColor="primary">
                                    <Tab icon={<AnalyticsIcon />} label="Analytics" />
                                    <Tab icon={<PeopleIcon />} label="User Management" />
                                    <Tab icon={<ModelIcon />} label="Model Governance" />
                                    <Tab icon={<SecurityIcon />} label="System Logs" />
                                </Tabs>
                            </Paper>
                        )}

                        {/* Notifications */}
                        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                        {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

                        {/* --- TAB 0: ANALYTICS --- */}
                        {tabValue === 0 && analytics && (
                            <Box>
                                {/* Stats Cards */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
                                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'text.primary' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <PeopleIcon color="primary" sx={{ mr: 1 }} />
                                            <Typography variant="h6" color="primary">Total Users</Typography>
                                        </Box>
                                        <Typography variant="h3">{analytics.total_users}</Typography>
                                        <Typography variant="caption" color="text.secondary">Registered Accounts</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'text.primary' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <SchoolIcon color="secondary" sx={{ mr: 1 }} />
                                            <Typography variant="h6" color="secondary">Students</Typography>
                                        </Box>
                                        <Typography variant="h3">{analytics.students_count}</Typography>
                                        <Typography variant="caption" color="text.secondary">Active Learners</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'text.primary' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <HealthIcon color="success" sx={{ mr: 1 }} />
                                            <Typography variant="h6" color="success">System Health</Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ mt: 1 }}>{analytics.system_health}</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'text.primary' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <PendingIcon color="warning" sx={{ mr: 1 }} />
                                            <Typography variant="h6" color="warning">Pending Reviews</Typography>
                                        </Box>
                                        <Typography variant="h3">{analytics.pending_reviews}</Typography>
                                        <Typography variant="caption" color="text.secondary">Incomplete Profiles</Typography>
                                    </Paper>
                                </Box>

                                {/* Charts */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                    <Paper sx={{ p: 3, height: 400 }}>
                                        <Typography variant="h6" gutterBottom>University Distribution</Typography>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics.university_distribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                                    outerRadius={120}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    onClick={handlePieClick}
                                                    cursor="pointer"
                                                >
                                                    {analytics.university_distribution.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ cursor: 'pointer' }} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                    <Paper sx={{ p: 3, height: 400 }}>
                                        <Typography variant="h6" gutterBottom>Top Predicted Jobs</Typography>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.job_trends}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Box>
                            </Box>
                        )}

                        {/* --- TAB 1: USER MANAGEMENT --- */}
                        {tabValue === 1 && (
                            <Paper sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                    <Typography variant="h6">User Management</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        {selectedUserIds.length > 0 && (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={handleDeleteUsers}
                                            >
                                                Delete ({selectedUserIds.length})
                                            </Button>
                                        )}
                                        <TextField
                                            size="small"
                                            placeholder="Search users..."
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
                                        <Button startIcon={<RefreshIcon />} onClick={fetchUsers}>Refresh</Button>
                                    </Box>
                                </Box>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900' }}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < users.length}
                                                        checked={users.length > 0 && selectedUserIds.length === users.length}
                                                        onChange={handleSelectAllUsers}
                                                    />
                                                </TableCell>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.map((u) => (
                                                <TableRow key={u.user_id} selected={selectedUserIds.includes(u.user_id)}>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={selectedUserIds.includes(u.user_id)}
                                                            onChange={() => handleSelectUser(u.user_id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{u.user_id}</TableCell>
                                                    <TableCell>{u.name}</TableCell>
                                                    <TableCell>{u.email}</TableCell>
                                                    <TableCell>
                                                        <FormControl variant="standard" size="small">
                                                            <Select
                                                                value={u.role}
                                                                onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                                                                sx={{ fontSize: '0.875rem' }}
                                                            >
                                                                <MenuItem value="student">Student</MenuItem>
                                                                <MenuItem value="admin">Admin</MenuItem>
                                                                <MenuItem value="moderator">Moderator</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton color="error" onClick={() => handleDeleteUser(u.user_id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        )}

                        {/* --- TAB 2: MODEL GOVERNANCE --- */}
                        {
                            tabValue === 2 && (
                                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                                    {/* Training Progress Card */}
                                    {analytics?.training_stats && (
                                        <Paper sx={{ p: 4, mb: 4, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AssessmentIcon sx={{ mr: 1 }} /> Training Coverage
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Box sx={{ width: '100%', mr: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={analytics.training_stats.total > 0
                                                            ? (analytics.training_stats.trained / analytics.training_stats.total) * 100
                                                            : 0}
                                                        sx={{ height: 10, borderRadius: 5 }}
                                                        color={analytics.training_stats.trained < analytics.training_stats.total ? "warning" : "success"}
                                                    />
                                                </Box>
                                                <Box sx={{ minWidth: 35 }}>
                                                    <Typography variant="body2" color="text.secondary">{
                                                        analytics.training_stats.total > 0
                                                            ? `${Math.round((analytics.training_stats.trained / analytics.training_stats.total) * 100)}%`
                                                            : '0%'
                                                    }</Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {analytics.training_stats.trained.toLocaleString()} of {analytics.training_stats.total.toLocaleString()} records trained.
                                                {analytics.training_stats.trained < analytics.training_stats.total && (
                                                    <Typography component="span" color="warning.main" fontWeight="bold" sx={{ ml: 1 }}>
                                                        Retraining recommended!
                                                    </Typography>
                                                )}
                                            </Typography>
                                        </Paper>
                                    )}

                                    {/* Single Data Entry Form */}
                                    <Paper sx={{ p: 4, mb: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            <UploadIcon sx={{ mr: 1 }} /> Add Training Record
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Manually enter a single student record for training.
                                        </Typography>

                                        <Box component="form"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const formData = new FormData(e.currentTarget);
                                                const data = Object.fromEntries(formData.entries());

                                                setLoading(true);
                                                api.post(`${API_BASE_URL}/api/admin/model/data/`, data)
                                                    .then(() => {
                                                        setSuccessMsg("Record added successfully");
                                                        (e.target as HTMLFormElement).reset();
                                                    })
                                                    .catch((err) => {
                                                        console.error(err);
                                                        setError("Failed to add record");
                                                    })
                                                    .finally(() => setLoading(false));
                                            }}
                                            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}
                                        >
                                            <TextField label="Degree" name="degree" required size="small" placeholder="e.g. B.Tech" />
                                            <TextField label="Specialization" name="specialization" required size="small" placeholder="e.g. Computer Science" />

                                            <TextField
                                                label="Skills"
                                                name="skills"
                                                required
                                                size="small"
                                                multiline
                                                rows={2}
                                                placeholder="e.g. Python, React, SQL"
                                                sx={{ gridColumn: 'span 2' }}
                                            />

                                            <TextField
                                                label="Certifications"
                                                name="certifications"
                                                required
                                                size="small"
                                                multiline
                                                rows={2}
                                                placeholder="e.g. AWS Solution Architect, Google Data Analytics"
                                                sx={{ gridColumn: 'span 2' }}
                                            />

                                            <TextField
                                                label="Target Job Role (Label)"
                                                name="target_job_role"
                                                required
                                                size="small"
                                                placeholder="e.g. Full Stack Developer"
                                                sx={{ gridColumn: 'span 2' }}
                                                helperText="This is the value the model will learn to predict."
                                            />

                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={loading}
                                                sx={{ gridColumn: 'span 2', mt: 2 }}
                                            >
                                                {loading ? <CircularProgress size={24} /> : 'Add Training Record'}
                                            </Button>
                                        </Box>
                                    </Paper>

                                    <Paper sx={{ p: 4, mb: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            <UploadIcon sx={{ mr: 1 }} /> Upload Training Data (CSV)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Upload a new CSV dataset to retrain the job prediction model.
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Button variant="outlined" component="label">
                                                Choose File
                                                <input type="file" hidden accept=".csv" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                                            </Button>
                                            <Typography variant="body2">{file ? file.name : 'No file chosen'}</Typography>
                                            <Button
                                                variant="contained"
                                                onClick={handleFileUpload}
                                                disabled={!file || loading}
                                            >
                                                {loading ? <CircularProgress size={24} /> : 'Upload'}
                                            </Button>
                                        </Box>
                                    </Paper>

                                    <Paper sx={{ p: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ModelIcon sx={{ mr: 1 }} /> Model Retraining
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Trigger the Python ML script to re-learn from the latest dataset.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color={isTraining ? "warning" : "secondary"}
                                            size="large"
                                            onClick={handleRetrain}
                                            disabled={loading || isTraining}
                                            startIcon={(loading || isTraining) ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                                        >
                                            {isTraining ? "Training in Progress..." : "Retrain Model Now"}
                                        </Button>
                                        {isTraining && (
                                            <Box sx={{ mt: 2, width: '100%' }}>
                                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                                    Training model on latest data... This may take a few minutes.
                                                </Typography>
                                                <LinearProgress color="secondary" />
                                            </Box>
                                        )}
                                    </Paper>
                                </Box>
                            )
                        }

                        {/* --- TAB 3: SYSTEM LOGS --- */}
                        {
                            tabValue === 3 && (
                                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                        <Typography variant="h6" fontWeight="bold" color="text.primary">System Logs</Typography>

                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            {selectedLogIds.length > 0 && (
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={handleDeleteLogs}
                                                >
                                                    Delete ({selectedLogIds.length})
                                                </Button>
                                            )}
                                            <TextField
                                                size="small"
                                                placeholder="Search logs..."
                                                value={logSearchQuery}
                                                onChange={handleLogSearch}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon color="action" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchLogs}>Refresh</Button>
                                        </Box>
                                    </Box>
                                    <TableContainer sx={{ borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                                        <Table size="medium">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900' }}>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            indeterminate={selectedLogIds.length > 0 && selectedLogIds.length < logs.length}
                                                            checked={logs.length > 0 && selectedLogIds.length === logs.length}
                                                            onChange={handleSelectAllLogs}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Target User</TableCell>
                                                    <TableCell align="right">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {logs.length > 0 ? logs.map((log) => (
                                                    <TableRow key={log.log_id} hover selected={selectedLogIds.includes(log.log_id)}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={selectedLogIds.includes(log.log_id)}
                                                                onChange={() => handleSelectLog(log.log_id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <SecurityIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                                                {log.admin__name}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={log.action_type}
                                                                size="small"
                                                                color={
                                                                    log.action_type.includes('DELETE') ? 'error' :
                                                                        log.action_type.includes('UPDATE') ? 'info' :
                                                                            log.action_type.includes('CREATE') ? 'success' : 'default'
                                                                }
                                                                variant="filled"
                                                                sx={{ fontWeight: 500 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{log.target_user__name}</TableCell>
                                                        <TableCell align="right">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => {
                                                                    if (window.confirm('Delete this log?')) {
                                                                        api.delete(`${API_BASE_URL}/api/admin/logs/`, { data: { log_ids: [log.log_id] } })
                                                                            .then(() => {
                                                                                setSuccessMsg("Log deleted");
                                                                                fetchLogs();
                                                                            });
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                            <Typography color="text.secondary">No logs found</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            )
                        }
                    </>
                )
                }
            </Container>

            {/* University Details Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    Students in {selectedCategory}
                </DialogTitle>
                <DialogContent dividers>
                    {categoryStudents.length > 0 ? (
                        <List>
                            {categoryStudents.map((student, index) => (
                                <React.Fragment key={index}>
                                    <ListItem
                                        alignItems="flex-start"
                                        secondaryAction={
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<ViewIcon />}
                                                onClick={() => handleViewProfile(student.user_id)}
                                            >
                                                View
                                            </Button>
                                        }
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {student.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {student.university}
                                                    </Typography>
                                                    {" — " + student.degree}
                                                    <br />
                                                    <Typography component="span" variant="caption" color="text.secondary">
                                                        {student.email}
                                                    </Typography>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    {index < categoryStudents.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">No students found or loading...</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDashboard;
