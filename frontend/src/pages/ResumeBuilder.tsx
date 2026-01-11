
import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, CircularProgress, MenuItem, Select, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { TEMPLATES } from '../Components/ResumeTemplates';

interface UserCompleteProfile {
    user_id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    profile_picture?: string;
    about_me?: string;
    education: any[];
    skills: any[];
    certifications: any[];
    placements: any[];
    predictions?: any[];
}

const ResumeBuilder: React.FC = () => {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState<UserCompleteProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTemplateId, setSelectedTemplateId] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [showVerificationLink, setShowVerificationLink] = useState(true);
    const resumeRef = useRef<HTMLDivElement>(null);

    const fetchProfile = async () => {
        if (!user) return;
        try {
            // Reusing the same endpoint as PublicProfile but for self (or we can use /users/me/ if exists, but /users/:id works)
            const res = await axios.get(`${API_BASE_URL}/api/users/${user.user_id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Fix predicted_roles if needed (handled by serializer now, but good to be safe)
            setProfile(res.data);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const handleDownloadPDF = async () => {
        if (!resumeRef.current) return;
        try {
            const canvas = await html2canvas(resumeRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Edu2Job_Resume_${profile?.name}.pdf`);
        } catch (e) {
            console.error("PDF Generation failed", e);
            alert("Failed to generate PDF. Please try checking console.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                // If sharing image, we'd need to convert to Blob file.
                // Sharing just URL for now, or we can generate Blob.
                // Let's share the profile text summary for simplicity or just URL
                await navigator.share({
                    title: 'My Edu2Job Resume',
                    text: `Check out my professional profile on Edu2Job!`,
                    url: window.location.href, // Or public profile link
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('Web Share API not supported in this browser.');
        }
    };

    // --- UTILS: Smart Summary Generator ---
    const generateSmartSummary = (p: UserCompleteProfile) => {
        if (!p) return "";
        const role = p.role || "Professional";
        // Calculate years of exp roughly if needed, for now just use data
        const skillsSnippet = p.skills.slice(0, 3).map(s => s.skill_name).join(", ");
        const company = p.placements && p.placements.length > 0 ? p.placements[0].company : null;
        const degree = p.education && p.education.length > 0 ? p.education[0].degree : "Degree";

        let summary = `Motivated ${role} with a strong foundation in ${degree || 'Technology'}. `;
        if (skillsSnippet) summary += `Proficient in ${skillsSnippet}. `;
        if (company) summary += `Experience working at ${company}, contributing to key projects. `;
        summary += `Passionate about leveraging skills to drive innovation and efficiency.`;

        return summary;
    };

    // Use effect to populate about_me if empty
    useEffect(() => {
        if (profile && !profile.about_me) {
            const autoSummary = generateSmartSummary(profile);
            setProfile(prev => prev ? { ...prev, about_me: autoSummary } : null);
        }
    }, [profile?.user_id]); // Run only when profile loads initially

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!profile) return <Typography>Error loading profile.</Typography>;

    const SelectedTemplateComponent = TEMPLATES.find(t => t.id === selectedTemplateId)?.component || TEMPLATES[0].component;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <style>
                {`
                    @media print {
                        @page {
                            size: auto;
                            margin: 0mm;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #printable-area, #printable-area * {
                            visibility: visible;
                        }
                        #printable-area {
                            position: fixed;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            margin: 0;
                            padding: 0; /* Remove padding to fit paper exactly */
                            background: white;
                            z-index: 9999;
                            overflow: visible !important; /* Allow footer to escape or stay visible */
                        }
                        .no-print {
                            display: none !important;
                        }
                        /* Force footer to be visible and correctly placed */
                        .verification-footer {
                            display: flex !important;
                            position: fixed !important; 
                            bottom: 0 !important;
                            left: 0 !important;
                            width: 100% !important;
                            z-index: 10000 !important;
                            background: white !important;
                            visibility: visible !important;
                            border-top: 1px dashed #ddd !important;
                            padding: 10px 0 !important;
                        }
                        /* Hide the absolute footer placeholder if needed, or let fixed override it */
                    }
                `}
            </style>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Left Sidebar: Controls (Hidden on Print) */}
                <Box className="no-print" sx={{ width: { xs: '100%', md: '25%' } }}>
                    <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Resume Settings</Typography>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Select Template</InputLabel>
                            <Select
                                value={selectedTemplateId}
                                label="Select Template"
                                onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                            >
                                {TEMPLATES.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.id}. {t.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="subtitle2" gutterBottom>Actions</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant={isEditing ? "contained" : "outlined"}
                                color={isEditing ? "warning" : "primary"}
                                startIcon={<EditIcon />}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? "Disable Editing" : "Enable Editing"}
                            </Button>

                            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
                            <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}>Share</Button>
                            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadPDF}>Download PDF</Button>
                        </Box>

                        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showVerificationLink}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowVerificationLink(e.target.checked)}
                                        color="success"
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        Include Verification Link
                                    </Typography>
                                }
                            />
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                Adds a "Verified by Edu2Job" credentials link to the footer.
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="success.main" gutterBottom>
                                ✓ Auto-Summary Active
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Need an "About Me"? We generated one based on your skills! Click it to edit.
                            </Typography>
                        </Box>
                    </Paper>
                </Box>

                {/* Right Area: Preview */}
                <Box sx={{ width: { xs: '100%', md: '75%' }, display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
                    <Box sx={{ transformOrigin: 'top left', transform: { xs: 'scale(0.5)', sm: 'scale(0.7)', md: 'scale(1)' }, mb: { xs: '-50%', md: 0 } }}>
                        <Paper
                            id="printable-area"
                            ref={resumeRef}
                            elevation={4}
                            sx={{
                                width: '210mm',
                                minHeight: '297mm',
                                p: 0,
                                bgcolor: 'white', // Ensure white background always
                                color: 'black',
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                position: 'relative'
                            }}
                        >
                            <SelectedTemplateComponent profile={profile} isEditing={isEditing} />

                            {/* Verification Footer (Printable) */}
                            {showVerificationLink && (
                                <Box
                                    className="verification-footer"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 10, // Raised slightly from 0 to avoid hardware clipping
                                        left: 0,
                                        width: '100%',
                                        py: 1,
                                        textAlign: 'center',
                                        borderTop: '1px dashed #ddd',
                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                        zIndex: 10
                                    }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                        <VerifiedUserIcon sx={{ fontSize: 14 }} /> Verified by Edu2Job
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ color: '#555', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                        {window.location.origin}/verify/{profile.user_id}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default ResumeBuilder;
