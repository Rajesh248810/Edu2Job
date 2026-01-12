import React, { useState } from 'react';
import { Box, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';
import { GoogleLogin } from '@react-oauth/google';

// Styles
const textFieldStyle = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: '#667eea',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
  },
};

const submitButtonStyle = {
  mt: 2,
  mb: 2,
  bgcolor: '#667eea',
  '&:hover': {
    bgcolor: '#5a6fd1',
  },
  py: 1.5,
  borderRadius: 2,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)',
};

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Pre-fill from Google Login Redirect
  React.useEffect(() => {
    if (location.state && location.state.email) {
      const { email, name } = location.state;
      const nameParts = name ? name.split(' ') : [];
      const fName = nameParts[0] || '';
      const lName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      setFormData(prev => ({
        ...prev,
        email: email || '',
        firstName: fName,
        lastName: lName
      }));

      setMessage({ type: 'success', text: 'Please complete your registration to continue.' });
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/register/`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }
      );

      if (response.status === 201) {
        login(response.data.user, response.data.token);
        setMessage({ type: 'success', text: 'Registration Successful! Redirecting...' });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Registration Error:', err);
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setMessage({ type: 'error', text: String(errorMessage) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }} >
      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            autoComplete="given-name"
            name="firstName"
            required
            fullWidth
            id="firstName"
            label="First Name"
            autoFocus
            value={formData.firstName}
            onChange={handleChange}
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            sx={{ ...textFieldStyle, flex: '1 1 calc(50% - 8px)' }}
            disabled={loading}
          />
          <TextField
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            sx={{ ...textFieldStyle, flex: '1 1 calc(50% - 8px)' }}
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            disabled={loading}
          />
        </Box>
        <TextField
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          sx={textFieldStyle}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
          disabled={loading}
        />
        <TextField
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          sx={textFieldStyle}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
          disabled={loading}
        />
        <TextField
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          sx={textFieldStyle}
          InputLabelProps={{ sx: { color: 'text.secondary' } }}
          disabled={loading}
        />
      </Box>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={submitButtonStyle}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
      </Button>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              setLoading(true);
              const res = await axios.post(`${API_BASE_URL}/api/google-login/`, {
                token: credentialResponse.credential
              });

              login(res.data.user, res.data.token);
              navigate('/dashboard');
            } catch (err: any) {
              console.error("Google Login Error:", err);
              setMessage({ type: 'error', text: "Google Login Failed: " + (err.response?.data?.error || err.message) });
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            setMessage({ type: 'error', text: "Google Login Failed" });
          }}
        />
      </Box>
    </Box >
  );
};

export default RegisterForm;