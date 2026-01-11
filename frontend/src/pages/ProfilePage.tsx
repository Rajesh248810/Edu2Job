import React from 'react';
import { Container, Box, Button } from '@mui/material';
import ProfileForm from '../Components/ProfileForm';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DescriptionIcon />}
          onClick={() => navigate('/resume')}
        >
          Build Resume
        </Button>
      </Box>
      {/* This renders the form you just wrote */}
      <ProfileForm />
    </Container>
  );
};

export default ProfilePage;