import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Button, Typography, Paper,
  Alert, CircularProgress, Card, CardContent,
  IconButton, Divider, Chip, MenuItem, useTheme, CardActions,
  Tabs, Tab, Fade, Avatar, Badge
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Delete as DeleteIcon, Edit as EditIcon,
  School as SchoolIcon,
  EmojiEvents as AwardIcon,
  Work as WorkIcon,
  Psychology as SkillIcon,
  Lock as LockIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  CalendarMonth as DateIcon,
  Grade as GradeIcon,
  Info as InfoIcon,
  CameraAlt as CameraAltIcon
} from '@mui/icons-material';
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import { DEGREES, SPECIALIZATIONS, DEGREE_SPECIALIZATION_MAP } from '../data/profileOptions';

import AsyncAutocomplete from './AsyncAutocomplete';

interface EducationData {
  degree: string;
  specialization: string;
  university: string;
  cgpa: string;
  year_of_completion: string;
}

interface CertificationData {
  cert_name: string;
  issuing_organization: string;
  issue_date: string;
}

interface PlacementData {
  role: string;
  company: string;
  placement_type: 'Job' | 'Internship';
  date_of_joining: string;
}

const ProfileForm: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const theme = useTheme();

  // Tabs State
  const [activeTab, setActiveTab] = useState(0);
  const sections = ['education', 'certification', 'skill', 'placement', 'password', 'about'];
  const activeSection = sections[activeTab] as 'education' | 'certification' | 'skill' | 'placement' | 'password' | 'about';

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Image Preview State
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form State
  const [eduData, setEduData] = useState<EducationData>({
    degree: '', specialization: '', university: '', cgpa: '', year_of_completion: ''
  });

  // Derived State / Contexts
  const degreeContext = useMemo(() => ({ degree: eduData.degree }), [eduData.degree]);
  const [certData, setCertData] = useState<CertificationData>({
    cert_name: '', issuing_organization: '', issue_date: ''
  });
  const [skillData, setSkillData] = useState<{ skill_name: string }>({ skill_name: '' });
  const [placementData, setPlacementData] = useState<PlacementData>({
    role: '', company: '', placement_type: 'Job', date_of_joining: ''
  });
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [aboutMe, setAboutMe] = useState('');

  // Reset form when switching sections
  useEffect(() => {
    setMessage(null);
    setEditingId(null);
    setEduData({ degree: '', specialization: '', university: '', cgpa: '', year_of_completion: '' });
    setCertData({ cert_name: '', issuing_organization: '', issue_date: '' });
    setSkillData({ skill_name: '' });
    setPlacementData({ role: '', company: '', placement_type: 'Job', date_of_joining: '' });
    setPasswordData({ password: '', confirmPassword: '' });

    // Initialize aboutMe if user exists
    if (user && user.about_me) {
      setAboutMe(user.about_me);
    }
  }, [activeSection, user]);

  // Force refresh user data on mount
  useEffect(() => {
    refreshUser();
  }, []);

  // Update previews when user data loads
  useEffect(() => {
    if (user) {
      setBannerPreview(user.banner_image || null);
      setAvatarPreview(user.profile_picture || null);
    }
  }, [user]);

  // Image Upload Handler
  const handleImageUpload = async (field: 'profile_picture' | 'banner_image', file: File) => {
    if (!file) return;

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    if (field === 'profile_picture') setAvatarPreview(objectUrl);
    else setBannerPreview(objectUrl);

    const formData = new FormData();
    formData.append(field, file);

    try {
      setLoading(true);
      // Using partial update endpoint
      await api.patch(`/api/users/${user.user_id}/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Image updated successfully!' });
      refreshUser();
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Changes
  const handleEduChange = (e: React.ChangeEvent<HTMLInputElement>) => setEduData({ ...eduData, [e.target.name]: e.target.value });
  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => setCertData({ ...certData, [e.target.name]: e.target.value });
  const handlePlacementChange = (e: React.ChangeEvent<HTMLInputElement>) => setPlacementData({ ...placementData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  // Populate form for editing
  const handleEdit = (item: any, type: 'education' | 'certification' | 'placement') => {
    // Scroll to form
    document.getElementById('profile-form-anchor')?.scrollIntoView({ behavior: 'smooth' });

    if (type === 'education') {
      setEditingId(item.education_id);
      setEduData({
        degree: item.degree,
        specialization: item.specialization,
        university: item.university,
        cgpa: item.cgpa,
        year_of_completion: item.year_of_completion
      });
    } else if (type === 'certification') {
      setEditingId(item.cert_id);
      setCertData({
        cert_name: item.cert_name,
        issuing_organization: item.issuing_organization,
        issue_date: item.issue_date
      });
    } else if (type === 'placement') {
      setEditingId(item.placement_id);
      setPlacementData({
        role: item.role,
        company: item.company,
        placement_type: item.placement_type,
        date_of_joining: item.date_of_joining
      });
    }
    setMessage(null);
  };

  const handleDelete = async (id: number, type: 'education' | 'certification' | 'skill' | 'placement') => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    try {
      await api.delete(`/api/${type}/${id}/`);
      setMessage({ type: 'success', text: 'Item deleted successfully!' });
      refreshUser();
    } catch (err: any) {
      console.error('Delete Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete item.';
      setMessage({ type: 'error', text: String(errorMessage) });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!user?.user_id) throw new Error('User not authenticated');

      let response;

      // Validation
      if (activeSection === 'education') {
        const cgpaVal = parseFloat(eduData.cgpa);
        const yearVal = parseInt(eduData.year_of_completion);
        if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 100) throw new Error("CGPA must be between 0 and 100.");
        const currentYear = new Date().getFullYear();
        if (isNaN(yearVal) || yearVal < 1950 || yearVal > currentYear + 10) throw new Error(`Year of completion must be between 1950 and ${currentYear + 10}.`);
      }

      // API Calls
      if (activeSection === 'education') {
        const payload = { user_id: user.user_id, ...eduData };
        response = editingId ? await api.put(`/api/education/${editingId}/`, payload) : await api.post(`/api/education/`, payload);
      } else if (activeSection === 'certification') {
        const payload = { user_id: user.user_id, ...certData };
        response = editingId ? await api.put(`/api/certification/${editingId}/`, payload) : await api.post(`/api/certification/`, payload);
      } else if (activeSection === 'skill') {
        const payload = { user_id: user.user_id, ...skillData };
        response = await api.post(`/api/skill/`, payload);
      } else if (activeSection === 'placement') {
        const payload = { user_id: user.user_id, ...placementData };
        response = editingId ? await api.put(`/api/placement/${editingId}/`, payload) : await api.post(`/api/placement/`, payload);
      } else if (activeSection === 'password') {
        if (passwordData.password !== passwordData.confirmPassword) throw new Error("Passwords do not match");
        response = await api.post(`/api/set-password/`, { password: passwordData.password });
      } else if (activeSection === 'about') {
        response = await api.patch(`/api/users/${user.user_id}/update/`, { about_me: aboutMe });
      }

      if (response && (response.status === 200 || response.status === 201)) {
        setMessage({ type: 'success', text: 'Saved successfully!' });
        setEditingId(null);
        setEduData({ degree: '', specialization: '', university: '', cgpa: '', year_of_completion: '' });
        setCertData({ cert_name: '', issuing_organization: '', issue_date: '' });
        setSkillData({ skill_name: '' });
        setPlacementData({ role: '', company: '', placement_type: 'Job', date_of_joining: '' });
        setPlacementData({ role: '', company: '', placement_type: 'Job', date_of_joining: '' });
        setPasswordData({ password: '', confirmPassword: '' });
        // Don't clear aboutMe, keep it visible
        refreshUser();
      }
    } catch (err: any) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save data.';
      setMessage({ type: 'error', text: String(errorMessage) });
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderEducationCard = (edu: any) => (
    <Grid size={{ xs: 12, md: 6 }} key={edu.education_id}>
      <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 3 } }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" fontWeight="bold">
                {edu.degree}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.specialization}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body2">{edu.university}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <DateIcon fontSize="small" color="action" />
              <Typography variant="body2">{edu.year_of_completion}</Typography>
              <Chip icon={<GradeIcon fontSize='small' />} label={`CGPA: ${edu.cgpa}`} size="small" color="success" variant='outlined' sx={{ ml: 'auto' }} />
            </Box>
          </Box>
        </CardContent>
        <CardActions disableSpacing sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <IconButton size="small" onClick={() => handleEdit(edu, 'education')} color="primary"><EditIcon /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(edu.education_id, 'education')} color="error"><DeleteIcon /></IconButton>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderCertificationCard = (cert: any) => (
    <Grid size={{ xs: 12, md: 6 }} key={cert.cert_id}>
      <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 3 } }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Avatar sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.main }}>
              <AwardIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {cert.cert_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cert.issuing_organization}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box display="flex" alignItems="center" gap={1}>
            <DateIcon fontSize="small" color="action" />
            <Typography variant="body2">Issued: {cert.issue_date}</Typography>
          </Box>
        </CardContent>
        <CardActions disableSpacing sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <IconButton size="small" onClick={() => handleEdit(cert, 'certification')} color="primary"><EditIcon /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(cert.cert_id, 'certification')} color="error"><DeleteIcon /></IconButton>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderPlacementCard = (placement: any) => (
    <Grid size={{ xs: 12, md: 6 }} key={placement.placement_id}>
      <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 3 } }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.main }}>
              <WorkIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {placement.role}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {placement.company}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DateIcon fontSize="small" /> Joined: {placement.date_of_joining}
            </Typography>
            <Chip label={placement.placement_type} size="small" color={placement.placement_type === 'Job' ? 'primary' : 'warning'} />
          </Box>
        </CardContent>
        <CardActions disableSpacing sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <IconButton size="small" onClick={() => handleEdit(placement, 'placement')} color="primary"><EditIcon /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(placement.placement_id, 'placement')} color="error"><DeleteIcon /></IconButton>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderSkillChips = () => (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
      <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1.5}>
        {user?.skills?.length > 0 ? user.skills.map((skill: any) => (
          <Chip
            key={skill.skill_id}
            label={skill.skill_name}
            onDelete={() => handleDelete(skill.skill_id, 'skill')}
            color="primary"
            variant="filled"
            sx={{ px: 1, py: 0.5, fontSize: '0.95rem' }}
          />
        )) : (
          <Typography color="text.secondary" fontStyle="italic">No skills added yet.</Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, mb: 10 }}>
      {/* Header */}
      {/* Header with Banner & Avatar */}
      <Box sx={{ position: 'relative', mb: 8 }}>
        {/* Banner */}
        <Box
          sx={{
            height: 200,
            bgcolor: 'grey.300',
            borderRadius: 4,
            backgroundImage: `url(${bannerPreview})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 3
          }}
        >
          <IconButton
            component="label"
            disabled={loading}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              backdropFilter: 'blur(4px)'
            }}
          >
            <input hidden accept="image/*" type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('banner_image', e.target.files[0])} />
            <EditIcon />
          </IconButton>
        </Box>

        {/* Avatar */}
        <Box sx={{ position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)' }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton
                component="label"
                disabled={loading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  boxShadow: 3,
                  width: 40,
                  height: 40
                }}
              >
                <input hidden accept="image/*" type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload('profile_picture', e.target.files[0])} />
                <CameraAltIcon fontSize="small" />
              </IconButton>
            }
          >
            <Avatar
              src={avatarPreview || undefined}
              sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: 3, bgcolor: 'primary.light', fontSize: '3rem' }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </Badge>
        </Box>
      </Box>

      {/* Title */}
      <Box mb={4} textAlign="center" mt={6}>
        <Typography variant="h4" fontWeight="800" gutterBottom sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}>
          {user?.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {user?.role === 'admin' ? 'Administrator' : 'Student & Learner'}
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 4, mb: 4, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ bgcolor: theme.palette.background.paper }}
        >
          <Tab icon={<SchoolIcon />} iconPosition="start" label="Education" />
          <Tab icon={<AwardIcon />} iconPosition="start" label="Certifications" />
          <Tab icon={<SkillIcon />} iconPosition="start" label="Skills" />
          <Tab icon={<WorkIcon />} iconPosition="start" label="Detailed Placements" />
          <Tab icon={<LockIcon />} iconPosition="start" label="Password" />
          <Tab icon={<InfoIcon />} iconPosition="start" label="About Me" />
        </Tabs>
      </Paper>

      {/* Error / Success Messages */}
      {message && (
        <Fade in={!!message}>
          <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>
        </Fade>
      )}

      {/* Content Section */}
      <Box sx={{ minHeight: 100 }}>
        {activeSection === 'education' && (
          <Grid container spacing={3}>
            {user?.education?.map(renderEducationCard)}
            {(!user?.education || user.education.length === 0) && (
              <Grid size={12} textAlign="center" py={5}>
                <Typography color="text.secondary">No education details added yet.</Typography>
              </Grid>
            )}
          </Grid>
        )}
        {activeSection === 'certification' && (
          <Grid container spacing={3}>
            {user?.certifications?.map(renderCertificationCard)}
            {(!user?.certifications || user.certifications.length === 0) && (
              <Grid size={12} textAlign="center" py={5}>
                <Typography color="text.secondary">No certifications added yet.</Typography>
              </Grid>
            )}
          </Grid>
        )}
        {activeSection === 'placement' && (
          <Grid container spacing={3}>
            {user?.placements?.map(renderPlacementCard)}
            {(!user?.placements || user.placements.length === 0) && (
              <Grid size={12} textAlign="center" py={5}>
                <Typography color="text.secondary">No placement details added yet.</Typography>
              </Grid>
            )}
          </Grid>
        )}
        {activeSection === 'skill' && (
          <Box>
            {renderSkillChips()}
          </Box>
        )}
        {activeSection === 'about' && (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="body1" paragraph fontStyle="italic" color="text.secondary">
              "{user?.about_me || "Share a brief summary about your professional background and goals..."}"
            </Typography>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => {
              setEditingId(999); // Dummy ID to trigger edit mode for about me
              document.getElementById('profile-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Edit About Me
            </Button>
          </Paper>
        )}
      </Box>

      {/* Add / Edit Form Section */}
      <Box id="profile-form-anchor" mt={2}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={3}>
            <Avatar sx={{ bgcolor: editingId ? theme.palette.warning.main : theme.palette.primary.main }}>
              {editingId ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              {activeSection === 'about' ? 'Update About Me' : editingId ? 'Edit Item' : activeSection === 'password' ? 'Change Password' : `Add New ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}`}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            {/* EDUCATION FORM */}
            {activeSection === 'education' && (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <AsyncAutocomplete
                    label="Degree"
                    value={eduData.degree}
                    onChange={(val) => setEduData({ ...eduData, degree: val || '' })}
                    staticOptions={DEGREES}
                    apiEndpoint="/api/suggest/?type=degree"
                    required={!eduData.degree}
                  />
                </Grid>
                <Grid size={12}>
                  <AsyncAutocomplete
                    label="Specialization/Major"
                    staticOptions={
                      eduData.degree && DEGREE_SPECIALIZATION_MAP[eduData.degree]
                        ? DEGREE_SPECIALIZATION_MAP[eduData.degree]
                        : SPECIALIZATIONS
                    }
                    value={eduData.specialization}
                    onChange={(val) => setEduData({ ...eduData, specialization: val || '' })}
                    apiEndpoint="/api/suggest/?type=specialization"
                    context={degreeContext}
                    required
                  />          </Grid>
                <Grid size={12}>
                  <AsyncAutocomplete
                    label="University"
                    value={eduData.university}
                    onChange={(val) => setEduData({ ...eduData, university: val || '' })}
                    apiEndpoint="/api/suggest/?type=university"
                    staticOptions={[]}
                    required={!eduData.university}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="CGPA (0-100)" name="cgpa" type="number" inputProps={{ step: "0.01", min: 0, max: 100 }} value={eduData.cgpa} onChange={handleEduChange} required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Year" name="year_of_completion" type="number" value={eduData.year_of_completion} onChange={handleEduChange} required />
                </Grid>
              </Grid>
            )}

            {/* CERTIFICATION FORM */}
            {activeSection === 'certification' && (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <AsyncAutocomplete
                    label="Certification Name"
                    value={certData.cert_name}
                    onChange={(val) => setCertData({ ...certData, cert_name: val || '' })}
                    apiEndpoint="/api/suggest/?type=certification"
                    staticOptions={[]}
                    required={!certData.cert_name}
                  />
                </Grid>
                <Grid size={12}>
                  <AsyncAutocomplete
                    label="Issuing Organization"
                    value={certData.issuing_organization}
                    onChange={(val) => setCertData({ ...certData, issuing_organization: val || '' })}
                    apiEndpoint="/api/suggest/?type=company"
                    staticOptions={[]}
                    required={!certData.issuing_organization}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="Issue Date" name="issue_date" type="date" InputLabelProps={{ shrink: true }} value={certData.issue_date} onChange={handleCertChange} required />
                </Grid>
              </Grid>
            )}

            {/* SKILL FORM */}
            {activeSection === 'skill' && (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <AsyncAutocomplete
                    label="Skill Name"
                    value={skillData.skill_name}
                    onChange={(val) => setSkillData({ ...skillData, skill_name: val || '' })}
                    apiEndpoint="/api/suggest/?type=skill"
                    staticOptions={[]}
                    required={!skillData.skill_name}
                  />
                </Grid>
              </Grid>
            )}

            {/* PLACEMENT FORM */}
            {activeSection === 'placement' && (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <AsyncAutocomplete
                    label="Role / Job Title"
                    value={placementData.role}
                    onChange={(val) => setPlacementData({ ...placementData, role: val || '' })}
                    apiEndpoint="/api/suggest/?type=role"
                    staticOptions={[]}
                    required={!placementData.role}
                  />
                </Grid>
                <Grid size={12}>
                  <AsyncAutocomplete
                    label="Company Name"
                    value={placementData.company}
                    onChange={(val) => setPlacementData({ ...placementData, company: val || '' })}
                    apiEndpoint="/api/suggest/?type=company"
                    staticOptions={[]}
                    required={!placementData.company}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField select fullWidth label="Type" name="placement_type" value={placementData.placement_type} onChange={handlePlacementChange} required>
                    <MenuItem value="Job">Job</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Date of Joining" name="date_of_joining" type="date" InputLabelProps={{ shrink: true }} value={placementData.date_of_joining} onChange={handlePlacementChange} required />
                </Grid>
              </Grid>
            )}

            {/* PASSWORD FORM */}
            {activeSection === 'password' && (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField fullWidth label="New Password" name="password" type="password" value={passwordData.password} onChange={handlePasswordChange} required />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                </Grid>
              </Grid>
            )}

            {/* ABOUT ME FORM */}
            {activeSection === 'about' && (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="About Me"
                    multiline
                    rows={4}
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder="I am a passionate software engineer..."
                  />
                </Grid>
              </Grid>
            )}

            {/* ACTION BUTTONS */}
            <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
              {editingId && (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setEditingId(null);
                    setEduData({ degree: '', specialization: '', university: '', cgpa: '', year_of_completion: '' });
                    setCertData({ cert_name: '', issuing_organization: '', issue_date: '' });
                    setPlacementData({ role: '', company: '', placement_type: 'Job', date_of_joining: '' });
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{
                  minWidth: 140,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: 3
                }}
              >
                {activeSection === 'about' ? 'Update Profile' : editingId ? 'Update Item' : activeSection === 'password' ? 'Update Password' : 'Save Item'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default ProfileForm;