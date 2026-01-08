import React from 'react';
import { Container, Box, Button } from '@mui/material';
import ProfileForm from '../Components/ProfileForm';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>
      {/* This renders the form you just wrote */}
      <ProfileForm />
    </Container>
  );
};

export default ProfilePage;