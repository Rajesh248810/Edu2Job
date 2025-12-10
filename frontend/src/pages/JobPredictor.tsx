import React, { useState } from 'react';
import {
    Box, Typography, Button, CircularProgress, Alert, LinearProgress, Chip, Fade, Grow,
    Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider
} from '@mui/material';
import { Psychology as PsychologyIcon, EmojiEvents as TrophyIcon, Work as WorkIcon, Person as PersonIcon, Business as BusinessIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import GlassCard from '../Components/GlassCard';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface Prediction {
    role: string;
    confidence: number;
    missing_skills: string[];
}

interface PlacedStudent {
    name: string;
    email: string;
    company: string;
    role: string;
    type: string;
    date: string;
    user_id: number;
    profile_picture?: string;
}

const JobPredictor: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [predictions, setPredictions] = useState<Prediction[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [placedStudents, setPlacedStudents] = useState<PlacedStudent[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');

    // Missing Skills Modal State
    const [openSkillsModal, setOpenSkillsModal] = useState(false);
    const [currentMissingSkills, setCurrentMissingSkills] = useState<string[]>([]);

    const handlePredict = async () => {
        setLoading(true);
        setError(null);
        setPredictions(null);

        try {
            if (!user || !user.user_id) {
                setError("User not authenticated.");
                setLoading(false);
                return;
            }

            const response = await api.post('/api/predict/', { user_id: user.user_id });

            if (response.status === 200) {
                setPredictions(response.data.predictions);
            }
        } catch (err: any) {
            console.error("Prediction Error:", err);
            setError(err.response?.data?.error || "Failed to get prediction. Ensure you have added education and skills to your profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewPlacedStudents = async (role: string) => {
        setSelectedRole(role);
        setOpenModal(true);
        setModalLoading(true);
        setPlacedStudents([]);

        try {
            const response = await api.get(`/api/placed-students/?role=${role}`);
            if (response.status === 200) {
                setPlacedStudents(response.data);
            }
        } catch (err) {
            console.error("Error fetching placed students:", err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleOpenSkillsModal = (skills: string[]) => {
        setCurrentMissingSkills(skills);
        setOpenSkillsModal(true);
    };

    const handleCloseSkillsModal = () => {
        setOpenSkillsModal(false);
    };

    const handleViewProfile = (userId: number) => {
        handleCloseModal();
        navigate(`/profile/${userId}`);
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 6, mb: 6, px: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                    variant="h3"
                    gutterBottom
                    fontWeight="800"
                    sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    AI Career Oracle
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    Unlock your potential. Our advanced AI analyzes your unique profile to predict the career path where you'll thrive.
                </Typography>
            </Box>

            <GlassCard sx={{ p: 5, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Background decoration */}
                <Box sx={{
                    position: 'absolute', top: -50, right: -50, width: 200, height: 200,
                    background: 'radial-gradient(circle, rgba(33,150,243,0.1) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%', zIndex: 0
                }} />

                <PsychologyIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3, position: 'relative', zIndex: 1 }} />

                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ position: 'relative', zIndex: 1 }}>
                    Ready to discover your future?
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    onClick={handlePredict}
                    disabled={loading}
                    sx={{
                        mt: 3, px: 6, py: 1.5, borderRadius: 50, fontSize: '1.1rem', fontWeight: 'bold',
                        boxShadow: '0 4px 14px 0 rgba(33,150,243,0.39)',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        position: 'relative', zIndex: 1
                    }}
                >
                    {loading ? <CircularProgress size={26} color="inherit" /> : 'Predict My Job Role'}
                </Button>

                {error && (
                    <Fade in={!!error}>
                        <Alert severity="error" sx={{ mt: 4, textAlign: 'left', borderRadius: 2 }}>
                            {error}
                        </Alert>
                    </Fade>
                )}
            </GlassCard>

            {predictions && (
                <Box sx={{ mt: 6 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                        Your Personalized Career Paths
                    </Typography>

                    {/* Top Prediction */}
                    <Grow in={true} timeout={800}>
                        <Box sx={{ mb: 4 }}>
                            <GlassCard sx={{
                                p: 4,
                                background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,203,243,0.05) 100%)',
                                border: '1px solid rgba(33,150,243,0.3)',
                                position: 'relative'
                            }}>
                                <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                                    <Chip
                                        icon={<TrophyIcon sx={{ fontSize: '1.2rem !important' }} />}
                                        label="Top Match"
                                        color="primary"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>
                                <Typography variant="h4" fontWeight="800" color="primary.main" gutterBottom>
                                    {predictions[0].role}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ mr: 2 }}>
                                        {predictions[0].confidence}% Match
                                    </Typography>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={predictions[0].confidence}
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                    </Box>
                                </Box>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Based on your skills and education, this role is the strongest fit for your profile.
                                </Typography>

                                {/* Missing Skills Section */}
                                {predictions[0].missing_skills && predictions[0].missing_skills.length > 0 && (
                                    <Box sx={{ mt: 2, mb: 2 }}>
                                        <Typography variant="subtitle2" color="error" fontWeight="bold" gutterBottom>
                                            Missing Skills for 100% Match:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {predictions[0].missing_skills.map((skill, idx) => (
                                                <Chip key={idx} label={skill} size="small" color="error" variant="outlined" />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Button
                                    variant="outlined"
                                    startIcon={<PersonIcon />}
                                    onClick={() => handleViewPlacedStudents(predictions[0].role)}
                                    sx={{ mt: 2, borderRadius: 20 }}
                                >
                                    View Placed Students
                                </Button>
                            </GlassCard>
                        </Box>
                    </Grow>

                    {/* Runners Up */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        {predictions.slice(1).map((pred, index) => (
                            <Grow in={true} timeout={1000 + (index * 200)} key={index}>
                                <Box>
                                    <GlassCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <WorkIcon color="action" sx={{ mr: 1.5 }} />
                                            <Typography variant="h6" fontWeight="bold">
                                                {pred.role}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ mr: 2, minWidth: 40 }}>
                                                {pred.confidence}%
                                            </Typography>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={pred.confidence}
                                                    color="secondary"
                                                    sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.05)' }}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Missing Skills for Runners Up */}
                                        {pred.missing_skills && pred.missing_skills.length > 0 && (
                                            <Box sx={{ mt: 2, mb: 2, flexGrow: 1 }}>
                                                <Typography variant="caption" color="error" fontWeight="bold">
                                                    Missing Skills:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                                    {pred.missing_skills.slice(0, 3).map((skill, idx) => (
                                                        <Chip key={idx} label={skill} size="small" color="error" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                                                    ))}
                                                    {pred.missing_skills.length > 3 && (
                                                        <Chip
                                                            label={`+${pred.missing_skills.length - 3}`}
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => handleOpenSkillsModal(pred.missing_skills)}
                                                            sx={{ fontSize: '0.7rem', height: 20, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        )}

                                        <Button
                                            size="small"
                                            variant="text"
                                            startIcon={<PersonIcon />}
                                            onClick={() => handleViewPlacedStudents(pred.role)}
                                            sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                                        >
                                            View Placed Students
                                        </Button>
                                    </GlassCard>
                                </Box>
                            </Grow>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Placed Students Modal */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                    Students Placed as {selectedRole}
                </DialogTitle>
                <Divider />
                <DialogContent>
                    {modalLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : placedStudents.length > 0 ? (
                        <List>
                            {placedStudents.map((student, index) => (
                                <React.Fragment key={index}>
                                    <ListItem
                                        alignItems="flex-start"
                                        secondaryAction={
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewProfile(student.user_id)}
                                                sx={{ borderRadius: 20, textTransform: 'none' }}
                                            >
                                                View Profile
                                            </Button>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={student.profile_picture ? `${API_BASE_URL}${student.profile_picture}` : undefined}
                                                sx={{ bgcolor: 'primary.main', width: 50, height: 50, mr: 2 }}
                                            >
                                                {student.name.charAt(0)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {student.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                                                    >
                                                        <BusinessIcon fontSize="small" color="action" />
                                                        {student.company} ({student.type})
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                        Placed on: {new Date(student.date).toLocaleDateString()}
                                                    </Typography>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    {index < placedStudents.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <Typography color="text.secondary">
                                No students found placed in this role yet.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Missing Skills Modal */}
            <Dialog
                open={openSkillsModal}
                onClose={handleCloseSkillsModal}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 2 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1, textAlign: 'center' }}>
                    Missing Skills
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', py: 2 }}>
                        {currentMissingSkills.map((skill, idx) => (
                            <Chip
                                key={idx}
                                label={skill}
                                color="error"
                                variant="outlined"
                                sx={{ fontWeight: 'bold' }}
                            />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    <Button onClick={handleCloseSkillsModal} variant="contained" sx={{ borderRadius: 20, px: 4 }}>
                        Got it
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobPredictor;