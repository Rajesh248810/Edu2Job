import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Divider, Avatar, Button, Container, IconButton, CircularProgress, Alert
} from '@mui/material';
import GlassCard from '../Components/GlassCard';
import {
  School as SchoolIcon,
  Verified as VerifiedIcon,
  Work as WorkIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';
import api from '../api';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100 }
  }
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Image Upload State
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [bannerImg, setBannerImg] = useState<File | null>(null);
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  const primaryEdu = user?.education?.[0];

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin-dashboard');
    }
    // Set initial previews
    if (user?.profile_picture) setPreviewProfile(`${API_BASE_URL}${user.profile_picture}`);
    if (user?.banner_image) setPreviewBanner(`${API_BASE_URL}${user.banner_image}`);
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'profile') {
        setProfilePic(file);
        setPreviewProfile(URL.createObjectURL(file));
      } else {
        setBannerImg(file);
        setPreviewBanner(URL.createObjectURL(file));
      }
      setMessage(null); // Clear any previous messages
    }
  };

  const handleSaveImages = async () => {
    if (!user?.user_id) return;
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    if (profilePic) formData.append('profile_picture', profilePic);
    if (bannerImg) formData.append('banner_image', bannerImg);

    try {
      await api.patch(`/api/users/${user.user_id}/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Profile images updated successfully!' });
      setProfilePic(null);
      setBannerImg(null);
      refreshUser();
    } catch (err: any) {
      console.error('Failed to update images:', err);
      setMessage({ type: 'error', text: 'Failed to update images.' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <Container maxWidth="lg">

      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Header Card */}
        <motion.div variants={itemVariants}>
          <GlassCard sx={{ p: 0, mb: 4, borderRadius: 4, overflow: 'hidden', position: 'relative' }} elevation={6}>
            {/* Banner */}
            <Box sx={{
              height: 200,
              bgcolor: 'grey.300',
              backgroundImage: previewBanner ? `url(${previewBanner})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}>
              <IconButton
                sx={{
                  position: 'absolute', top: 16, right: 16,
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
                component="label"
              >
                <EditIcon color="primary" />
                <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
              </IconButton>
            </Box>

            {/* Profile Info Section */}
            <Box sx={{ px: 4, pb: 4, mt: -6, position: 'relative' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={previewProfile || undefined}
                  sx={{
                    width: 120, height: 120,
                    border: '4px solid white',
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                    boxShadow: 2
                  }}
                >
                  {getInitials(user?.name)}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute', bottom: 5, right: 5,
                    bgcolor: 'white', border: '1px solid #eee',
                    '&:hover': { bgcolor: 'grey.100' },
                    boxShadow: 1
                  }}
                  component="label"
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" color="primary" />
                  <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
                </IconButton>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{user?.name}</Typography>
                  <Typography variant="h6" color="text.secondary">
                    {primaryEdu ? `${primaryEdu.degree} in ${primaryEdu.specialization}` : user?.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Save Button if changes */}
                  {(profilePic || bannerImg) && (
                    <Button variant="contained" onClick={handleSaveImages} disabled={loading} color="success">
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
                  )}
                  <Button variant="outlined" onClick={() => navigate('/profile')}>
                    Edit Details
                  </Button>
                </Box>
              </Box>
            </Box>
          </GlassCard>
        </motion.div>

        {/* Quick Stats / Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(102,126,234,0.14)', color: 'primary.main', mr: 2 }}><SchoolIcon /></Avatar>
                <Typography variant="h6" fontWeight="bold">Academic Profile</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {user?.education?.length ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{user.education[0].university}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.education[0].degree} • {user.education[0].year_of_completion}</Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mt: 1 }}>CGPA: {user.education[0].cgpa}</Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">No details added yet.</Typography>
              )}
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(199, 102, 214, 0.12)', color: 'secondary.main', mr: 2 }}><VerifiedIcon /></Avatar>
                <Typography variant="h6" fontWeight="bold">Certifications</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {user?.certifications?.length ? (
                user.certifications.map((cert: any, i: number) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">{cert.cert_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{cert.issuing_organization}</Typography>
                  </Box>
                ))
              ) : <Typography color="text.secondary">No certifications.</Typography>}
            </GlassCard>
          </motion.div>

          {/* Placement Section */}
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.14)', color: 'success.main', mr: 2 }}><WorkIcon /></Avatar>
                <Typography variant="h6" fontWeight="bold">Placement Status</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {user?.placements?.length ? (
                user.placements.map((placement: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{placement.role}</Typography>
                    <Typography variant="body2" color="text.secondary">at {placement.company}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                      {placement.placement_type} • Joined: {placement.date_of_joining}
                    </Typography>
                    {index < user.placements.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No placement details available.</Typography>
              )}
            </GlassCard>
          </motion.div>

          {/* Skills Section */}
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 187, 40, 0.14)', color: 'warning.main', mr: 2 }}><VerifiedIcon /></Avatar>
                <Typography variant="h6" fontWeight="bold">Skills</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {user?.skills?.length ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.skills.map((skill: any, i: number) => (
                    <Box key={i} sx={{
                      bgcolor: 'rgba(255, 187, 40, 0.1)',
                      color: 'warning.dark',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      fontWeight: 'medium'
                    }}>
                      {skill.skill_name}
                    </Box>
                  ))}
                </Box>
              ) : <Typography color="text.secondary">No skills added.</Typography>}
            </GlassCard>
          </motion.div>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Dashboard;