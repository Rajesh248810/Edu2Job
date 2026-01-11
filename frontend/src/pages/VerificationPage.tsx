
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Paper, CircularProgress, Divider, Chip, Grid } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface UserVerificationProfile {
    user_id: number;
    name: string;
    email: string; // Maybe hide partial email for privacy?
    role: string;
    profile_picture?: string;
    education: any[];
    skills: any[];
    placements: any[];
    certifications?: any[];
    predictions?: any[];
    about_me?: string;
}

const VerificationPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [profile, setProfile] = useState<UserVerificationProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Using the public profile endpoint or user endpoint. 
                // Assuming /api/users/{id} is accessible or we verify via a specific public endpoint.
                // For now, reusing the standard fetch provided it allows public access or we handle auth gracefully.
                // If it requires auth, this public page might fail. Ideally, we need a public endpoint.
                // However, based on instructions "fetch data from user table", we will try the standard GET.
                const res = await axios.get(`${API_BASE_URL}/api/users/${userId}/`);
                setProfile(res.data);
            } catch (err) {
                console.error("Verification failed", err);
                setError("Unable to verify user. The ID may be invalid or the profile is private.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchProfile();
    }, [userId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (error || !profile) return (
        <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>Verification Failed</Typography>
            <Typography color="text.secondary">{error}</Typography>
        </Container>
    );

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper elevation={6} sx={{ p: 0, overflow: 'hidden', borderRadius: 4, bgcolor: '#fdfdfd' }}>
                {/* Certificate Header */}
                <Box sx={{ bgcolor: '#27ae60', color: 'white', p: 4, textAlign: 'center', position: 'relative' }}>
                    <VerifiedUserIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h3" fontWeight="bold" gutterBottom>Verified Professional</Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                        The credentials of this candidate have been verified by Edu2Job.
                    </Typography>
                </Box>

                <Box sx={{ p: 6 }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        {profile.profile_picture && (
                            <Box sx={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto', mb: 3, border: '4px solid #27ae60' }}>
                                <img src={`${API_BASE_URL}${profile.profile_picture}`} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                        )}
                        <Typography variant="h4" fontWeight="bold" gutterBottom>{profile.name}</Typography>
                        <Chip icon={<CheckCircleIcon />} label="Identity Verified" color="success" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#2c3e50' }}>
                                <SchoolIcon color="primary" /> Verified Education
                            </Typography>
                            {profile.education.length > 0 ? profile.education.map((e, i) => (
                                <Box key={i} sx={{ mb: 2, pl: 4, borderLeft: '2px solid #eee' }}>
                                    <Typography fontWeight="bold">{e.university}</Typography>
                                    <Typography variant="body2" color="text.secondary">{e.degree} in {e.specialization}</Typography>
                                    <Typography variant="caption" color="text.secondary">Completed: {e.year_of_completion}</Typography>
                                </Box>
                            )) : <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>No education records found.</Typography>}
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#2c3e50' }}>
                                <WorkIcon color="primary" /> Verified Experience
                            </Typography>
                            {profile.placements.length > 0 ? profile.placements.map((p, i) => (
                                <Box key={i} sx={{ mb: 2, pl: 4, borderLeft: '2px solid #eee' }}>
                                    <Typography fontWeight="bold">{p.role}</Typography>
                                    <Typography variant="body2" color="text.secondary">at {p.company}</Typography>
                                    <Typography variant="caption" color="text.secondary">Joined: {p.date_of_joining}</Typography>
                                </Box>
                            )) : <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>No experience records found.</Typography>}
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#2c3e50' }}>
                            <VerifiedUserIcon color="primary" /> Verified Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pl: { xs: 2, md: 4 } }}>
                            {profile.skills && profile.skills.length > 0 ? profile.skills.map((s, i) => (
                                <Chip key={i} label={s.skill_name} variant="outlined" color="primary" size="small" />
                            )) : <Typography variant="body2" color="text.secondary">No skills listed.</Typography>}
                        </Box>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#2c3e50' }}>
                            <WorkspacePremiumIcon color="primary" /> Verified Certifications
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pl: { xs: 2, md: 4 } }}>
                            {profile.certifications && profile.certifications.length > 0 ? profile.certifications.map((c, i) => (
                                <Chip key={i} label={`${c.cert_name} (${c.issuing_organization})`} variant="outlined" />
                            )) : <Typography variant="body2" color="text.secondary">No certifications verified.</Typography>}
                        </Box>
                    </Box>

                    {profile.predictions && profile.predictions.length > 0 && (() => {
                        const prediction = profile.predictions[0];
                        // Safely access the first confidence score object which contains details
                        const topMatch = Array.isArray(prediction.confidence_scores) && prediction.confidence_scores.length > 0
                            ? prediction.confidence_scores[0]
                            : null;

                        // If for some reason access fails, fallback
                        const confidence = topMatch?.confidence || "N/A";
                        const missingSkills = topMatch?.missing_skills || [];

                        return (
                            <Box sx={{ mt: 5, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2c3e50' }}>
                                    <PsychologyIcon color="secondary" /> AI Career Analysis
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Latest Predicted Role</Typography>
                                        <Typography variant="h5" color="primary" fontWeight="bold">
                                            {prediction.predicted_roles}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Confidence Score</Typography>
                                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#27ae60' }}>
                                            {confidence !== "N/A" ? `${confidence}%` : "N/A"}
                                        </Typography>
                                    </Grid>
                                    {missingSkills.length > 0 && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Recommended Skills to Acquire</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                {missingSkills.map((skill: string, idx: number) => (
                                                    <Chip key={idx} label={skill} size="small" color="warning" variant="outlined" />
                                                ))}
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        );
                    })()}

                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            Verification ID: {profile.user_id} • Generated by Edu2Job Verification System
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default VerificationPage;
