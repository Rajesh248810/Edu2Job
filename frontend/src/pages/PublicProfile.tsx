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
    Work as WorkIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import GlassCard from '../Components/GlassCard';

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
    email: string;
    education: Education[];
    certifications: Certification[];
    skills: Skill[];
    placements: Placement[];
    profile_picture?: string;
    banner_image?: string;
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
                            border: '4px solid white',
                            boxShadow: 2
                        }}
                    >
                        {getInitials(profile.name)}
                    </Avatar>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>{profile.name}</Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {profile.role}
                        {profile.placements && profile.placements.length > 0 && (
                            <Chip
                                label="Placed"
                                color="success"
                                size="small"
                                icon={<VerifiedIcon />}
                                sx={{ ml: 1, fontWeight: 'bold' }}
                            />
                        )}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">{profile.email}</Typography>
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

            </Box>
        </Container>
    );
};

export default PublicProfile;
