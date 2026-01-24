import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Container, Avatar, Divider, Button, CircularProgress, Alert, Chip
} from '@mui/material';
import {
    School as SchoolIcon,
    Verified as VerifiedIcon,
    ArrowBack as ArrowBackIcon,
    Code as CodeIcon,
    Work as WorkIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import GlassCard from '../Components/GlassCard';
import PrimeBadge from '../Components/PrimeBadge';
import { Tooltip } from '@mui/material';

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

interface Skill {
    skill_name: string;
}

interface Placement {
    role: string;
    company: string;
    placement_type: string;
    date_of_joining: string;
}

interface UserProfile {
    user_id: number;
    name: string;
    role: string;
    email?: string; // Optional because it might be masked
    education: Education[];
    certifications: Certification[];
    skills: Skill[];
    placements: Placement[];
    profile_picture?: string;
    banner_image?: string;
    is_prime?: boolean;
    hire_now?: boolean;
    predictions?: any[];
}

const PublicProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/`);
                setProfile(response.data);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError('Failed to load user profile.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !profile) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error || 'User not found'}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/community')} sx={{ mt: 2 }}>
                    Back to Community
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/community')} sx={{ mb: 2 }}>
                Back to Community
            </Button>

            {/* Header Card */}
            <GlassCard sx={{ p: 0, mb: 4, borderRadius: 4, textAlign: 'center', overflow: 'hidden' }} elevation={6}>
                {/* Banner Image */}
                <Box sx={{
                    height: 200,
                    bgcolor: 'grey.300',
                    backgroundImage: profile.banner_image ? `url(${API_BASE_URL}${profile.banner_image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }} />

                <Box sx={{ px: 4, pb: 4, mt: -6 }}>
                    <Avatar
                        src={profile.profile_picture ? `${API_BASE_URL}${profile.profile_picture}` : undefined}
                        sx={{
                            width: 120,
                            height: 120,
                            mx: 'auto',
                            mb: 2,
                            bgcolor: 'primary.main',
                            fontSize: '2.5rem',
                            border: profile.is_prime ? '4px solid #FFD700' : '4px solid white',
                            boxShadow: profile.is_prime ? '0 0 20px #FFD700' : 2,
                        }}
                    >
                        {getInitials(profile.name)}
                    </Avatar>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h3" fontWeight="bold">
                            {profile.name}
                        </Typography>
                        {profile.is_prime && <PrimeBadge />}
                    </Box>

                    <Typography variant="h6" color="text.secondary" gutterBottom sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        {profile.role}
                        {profile.placements && profile.placements.length > 0 && (
                            <Chip
                                label="Placed"
                                color="success"
                                size="small"
                                icon={<VerifiedIcon />}
                                sx={{ fontWeight: 'bold' }}
                            />
                        )}
                        {profile.hire_now && (
                            <Chip
                                label="Hire Me"
                                color="secondary"
                                size="small"
                                sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', color: 'white' }}
                            />
                        )}
                    </Typography>

                    {profile.email ? (
                        <Typography variant="body1" color="text.secondary">{profile.email}</Typography>
                    ) : (
                        <Tooltip title="Upgrade to Prime to view contact details">
                            <Typography
                                variant="body1"
                                color="text.disabled"
                                sx={{ filter: 'blur(4px)', cursor: 'pointer', display: 'inline-block' }}
                                onClick={() => navigate('/upgrade')}
                            >
                                hidden_email@example.com
                            </Typography>
                        </Tooltip>
                    )}
                </Box>
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
                    {profile.education?.length ? (
                        profile.education.map((edu, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">{edu.university}</Typography>
                                <Typography variant="body2" color="text.secondary">{edu.degree} in {edu.specialization}</Typography>
                                <Typography variant="body2" color="text.secondary">Class of {edu.year_of_completion}</Typography>
                                <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>CGPA: {edu.cgpa}</Typography>
                                {index < profile.education.length - 1 && <Divider sx={{ my: 2 }} />}
                            </Box>
                        ))
                    ) : (
                        <Typography color="text.secondary">No education details available.</Typography>
                    )}
                </GlassCard>

                {/* Placement Section */}
                <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.14)', color: 'success.main', mr: 2 }}><WorkIcon /></Avatar>
                        <Typography variant="h6" fontWeight="bold">Placement Status</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {profile.placements?.length ? (
                        profile.placements.map((placement, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">{placement.role}</Typography>
                                <Typography variant="body2" color="text.secondary">at {placement.company}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip label={placement.placement_type} size="small" color="success" variant="outlined" />
                                    <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                                        Joined: {placement.date_of_joining}
                                    </Typography>
                                </Box>
                                {index < profile.placements.length - 1 && <Divider sx={{ my: 2 }} />}
                            </Box>
                        ))
                    ) : (
                        <Typography color="text.secondary">No placement details available.</Typography>
                    )}
                </GlassCard>

                {/* Certifications Section */}
                <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(199, 102, 214, 0.12)', color: 'secondary.main', mr: 2 }}><VerifiedIcon /></Avatar>
                        <Typography variant="h6" fontWeight="bold">Certifications</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {profile.certifications?.length ? (
                        profile.certifications.map((cert, i) => (
                            <Box key={i} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold">{cert.cert_name}</Typography>
                                <Typography variant="caption" color="text.secondary">Issued by {cert.issuing_organization}</Typography>
                                <Typography variant="caption" display="block" color="text.secondary">Date: {cert.issue_date}</Typography>
                                {i < profile.certifications.length - 1 && <Divider sx={{ my: 1 }} />}
                            </Box>
                        ))
                    ) : (
                        <Typography color="text.secondary">No certifications available.</Typography>
                    )}
                </GlassCard>

                {/* Skills Section */}
                <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255, 152, 0, 0.12)', color: 'warning.main', mr: 2 }}><CodeIcon /></Avatar>
                        <Typography variant="h6" fontWeight="bold">Skills</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {profile.skills?.length ? (
                            profile.skills.map((skill, i) => (
                                <Chip key={i} label={skill.skill_name} color="primary" variant="outlined" />
                            ))
                        ) : (
                            <Typography color="text.secondary">No skills added.</Typography>
                        )}
                    </Box>
                </GlassCard>

                {/* Latest Prediction (Prime) */}
                <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(233, 30, 99, 0.12)', color: 'secondary.main', mr: 2 }}>
                            {!profile.predictions ? <LockIcon /> : <VerifiedIcon />}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">Career Insight</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {profile.predictions && profile.predictions.length > 0 ? (
                        profile.predictions.slice(0, 1).map((pred: any, i: number) => {
                            // Helper to extract data safer since structure might vary
                            const role = Array.isArray(pred.predicted_roles) ? pred.predicted_roles[0] : pred.predicted_roles;
                            // Confidence might be in confidence_scores (could be dict or list?)
                            // Assuming simple structure for now or map simply
                            let confidence = 0;
                            if (pred.confidence_scores) {
                                if (Array.isArray(pred.confidence_scores)) confidence = pred.confidence_scores[0];
                                else if (typeof pred.confidence_scores === 'object') confidence = Object.values(pred.confidence_scores)[0] as number;
                            }

                            return (
                                <Box key={i}>
                                    <Typography variant="subtitle2" color="text.secondary">Latest AI Prediction</Typography>
                                    <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                                        {role || 'Unknown Role'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Confidence: {confidence ? `${(confidence * 100).toFixed(1)}%` : 'N/A'}
                                    </Typography>
                                </Box>
                            );
                        })
                    ) : (
                        !profile.predictions ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Unlock insights to see this user's latest career prediction.
                                </Typography>
                                <Button variant="outlined" size="small" onClick={() => navigate('/upgrade')}>
                                    Unlock with Prime
                                </Button>
                            </Box>
                        ) : (
                            <Typography color="text.secondary">No predictions run yet.</Typography>
                        )
                    )}
                </GlassCard>

            </Box>
        </Container>
    );
};

export default PublicProfile;
