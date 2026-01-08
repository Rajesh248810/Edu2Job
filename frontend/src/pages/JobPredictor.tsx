import React, { useState } from 'react';
import {
    Box, Typography, Button, CircularProgress, Alert, LinearProgress, Chip, Fade, Grow,
    Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Rating, TextField
} from '@mui/material';
import { Psychology as PsychologyIcon, EmojiEvents as TrophyIcon, Work as WorkIcon, Person as PersonIcon, Business as BusinessIcon, Visibility as VisibilityIcon, History as HistoryIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, ThumbUp, ThumbDown, Close as CloseIcon } from '@mui/icons-material';
import { IconButton, Collapse } from '@mui/material';

// ... (other imports)

const HistoryItem = ({ item }: { item: any }) => {
    const [open, setOpen] = useState(false);
    const topPred = item.details && Array.isArray(item.details) && item.details.length > 0 ? item.details[0] : null;
    const missingSkills = topPred ? topPred.missing_skills : [];

    return (
        <React.Fragment>
            <ListItem alignItems="flex-start"
                secondaryAction={
                    <IconButton edge="end" onClick={() => setOpen(!open)}>
                        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                }
                sx={{ cursor: 'pointer' }}
                onClick={() => setOpen(!open)}
            >
                <ListItemText
                    primary={
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {item.role}
                            </Typography>
                            {item.is_flagged && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Chip label="Flagged by Admin" size="small" color="error" variant="outlined" />
                                    {item.corrected_role && (
                                        <Typography variant="caption" color="error" fontWeight="bold">
                                            Correction: {item.corrected_role}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    }
                    secondary={
                        <React.Fragment>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                                {item.confidence}% Confidence
                            </Typography>
                            {item.admin_notes && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                    Note: {item.admin_notes}
                                </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
                            </Typography>
                        </React.Fragment>
                    }
                />
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2, pr: 2, pb: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                    {missingSkills && missingSkills.length > 0 ? (
                        <>
                            <Typography variant="caption" color="error" fontWeight="bold" gutterBottom>
                                Missing Skills:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {missingSkills.map((skill: string, idx: number) => (
                                    <Chip key={idx} label={skill} size="small" color="error" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                ))}
                            </Box>
                        </>
                    ) : (
                        <Typography variant="caption" color="success.main" fontWeight="bold">
                            No missing skills! You are a perfect match.
                        </Typography>
                    )}
                </Box>
            </Collapse>
            <Divider component="li" />
        </React.Fragment>
    );
};

// ... inside JobPredictor ...

// Replace the list rendering:
// <List>
//     {historyData.map((item, index) => (
//         <HistoryItem key={index} item={item} />
//     ))}
// </List>
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

    // History Modal State
    const [openHistoryModal, setOpenHistoryModal] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);

    // Feedback State
    const [predictionId, setPredictionId] = useState<number | null>(null);
    const [feedbackStep, setFeedbackStep] = useState<'initial' | 'detailed' | 'submitted' | 'closed'>('initial');
    const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState('');

    const handleFeedbackSubmit = async () => {
        if (!rating) return;
        const fullComment = `[Tags: ${selectedTags.join(', ')}] ${comment}`;

        try {
            await api.post('/api/feedback/', {
                user_id: user?.user_id,
                prediction_id: predictionId || (historyData.length > 0 ? historyData[0].id : null),
                rating: rating,
                comments: fullComment
            });
            setFeedbackStep('submitted');
        } catch (err) {
            console.error("Feedback failed", err);
        }
    };


    const handleOpenHistory = async () => {
        setOpenHistoryModal(true);
        setHistoryLoading(true);
        try {
            if (!user?.user_id) return;
            const response = await api.get(`/api/prediction-history/?user_id=${user.user_id}`);
            if (response.status === 200) {
                setHistoryData(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setHistoryLoading(false);
        }
    };

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
                setPredictionId(response.data.prediction_id);
                // Reset feedback state
                setFeedbackStep('initial');
                setIsHelpful(null);
                setSelectedTags([]);
                setRating(0);
                setComment('');
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
                    startIcon={<HistoryIcon />}
                    onClick={handleOpenHistory}
                    sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
                >
                    History
                </Button>

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

                    {/* Feedback Section */}
                    {feedbackStep !== 'closed' && (
                        <Grow in={true} timeout={900}>
                            <Box sx={{ mb: 4 }}>
                                <GlassCard sx={{ p: 4, textAlign: 'center' }}>
                                    {feedbackStep === 'submitted' ? (
                                        <Box sx={{ py: 2, position: 'relative' }}>
                                            <IconButton
                                                onClick={() => setFeedbackStep('closed')}
                                                sx={{ position: 'absolute', top: -10, right: -10 }}
                                                size="small"
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                            <Avatar sx={{ bgcolor: 'success.light', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                                                <ThumbUp />
                                            </Avatar>
                                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                Thanks for your feedback!
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                We'll use this to improve your future career predictions.
                                            </Typography>
                                        </Box>
                                    ) : feedbackStep === 'initial' ? (
                                        <Box>
                                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                                Was this prediction helpful?
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
                                                <Button
                                                    variant="outlined"
                                                    size="large"
                                                    startIcon={<ThumbUp />}
                                                    onClick={() => {
                                                        setIsHelpful(true);
                                                        setRating(4);
                                                        setFeedbackStep('detailed');
                                                    }}
                                                    sx={{ borderRadius: 50, px: 4, py: 1.5, borderColor: 'success.main', color: 'success.main', '&:hover': { bgcolor: 'success.light', color: 'white' } }}
                                                >
                                                    Yes, it was
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="large"
                                                    startIcon={<ThumbDown />}
                                                    onClick={() => {
                                                        setIsHelpful(false);
                                                        setRating(2);
                                                        setFeedbackStep('detailed');
                                                    }}
                                                    sx={{ borderRadius: 50, px: 4, py: 1.5, borderColor: 'error.main', color: 'error.main', '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                                >
                                                    No, not really
                                                </Button>
                                            </Box>
                                        </Box>
                                    ) : ( // detailed step
                                        <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                                {isHelpful ? 'Great! What did you like?' : 'Tell us what went wrong'}
                                            </Typography>

                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3, mt: 2 }}>
                                                {(isHelpful
                                                    ? ["Accurate Role", "Good Skill Match", "Helpful Insights", "Motivating"]
                                                    : ["Inaccurate Role", "Skills Mismatch", "Too Generic", "Irrelevant"]
                                                ).map((tag) => (
                                                    <Chip
                                                        key={tag}
                                                        label={tag}
                                                        onClick={() => {
                                                            setSelectedTags(prev =>
                                                                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                                            );
                                                        }}
                                                        color={selectedTags.includes(tag) ? (isHelpful ? "success" : "error") : "default"}
                                                        variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                                                        sx={{ cursor: 'pointer' }}
                                                    />
                                                ))}
                                            </Box>

                                            <Box sx={{ mb: 2 }}>
                                                <Typography component="legend">Rate this prediction</Typography>
                                                <Rating
                                                    name="prediction-rating"
                                                    value={rating}
                                                    onChange={(_, newValue) => setRating(newValue)}
                                                    size="large"
                                                />
                                            </Box>

                                            <TextField
                                                placeholder="Any other comments?"
                                                multiline
                                                rows={2}
                                                variant="outlined"
                                                fullWidth
                                                size="small"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                sx={{ mb: 3 }}
                                            />

                                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                                <Button onClick={() => setFeedbackStep('initial')} color="inherit">
                                                    Back
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleFeedbackSubmit}
                                                    color={isHelpful ? "success" : "primary"}
                                                    disabled={!rating}
                                                >
                                                    Submit Feedback
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
                                </GlassCard>
                            </Box>
                        </Grow>
                    )}


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

            {/* History Modal */}
            <Dialog
                open={openHistoryModal}
                onClose={() => setOpenHistoryModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon color="primary" /> Prediction History
                </DialogTitle>
                <Divider />
                <DialogContent>
                    {historyLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : historyData.length > 0 ? (
                        <List>
                            {historyData.map((item, index) => (
                                <HistoryItem key={index} item={item} />
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <Typography color="text.secondary">No prediction history found.</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistoryModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default JobPredictor;