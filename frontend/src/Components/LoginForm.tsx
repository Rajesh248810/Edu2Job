import React, { useState } from 'react';
import { Box, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);

    // TEMPORARY: Mock Admin Login for Testing
    if (email === 'admin@test.com' && password === 'admin') {
      const mockAdminUser = {
        user_id: 999,
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'admin'
      };
      login(mockAdminUser, 'mock-admin-token');
      navigate('/admin-dashboard');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login/`, {
        email,
        password
      });
      // ... rest of the logic ...

      console.log("Login Success:", response.data);
      login(response.data.user, response.data.token);

      if (response.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error("Login Error:", err);

      let errorMessage = 'Login failed.';

      if (err.response) {
        const serverMsg = err.response.data?.error || JSON.stringify(err.response.data);
        errorMessage = `Server Error (${err.response.status}): ${serverMsg}`;
      } else if (err.request) {
        errorMessage = 'Network Error: No response from server. Is the Django Backend running?';
      } else {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        variant="outlined"
        InputLabelProps={{ sx: { color: 'text.secondary' } }}
        sx={textFieldStyle}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        variant="outlined"
        InputLabelProps={{ sx: { color: 'text.secondary' } }}
        sx={textFieldStyle}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={submitButtonStyle}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
      </Button>

      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            console.log(credentialResponse);
            try {
              setLoading(true);
              const res = await axios.post(`${API_BASE_URL}/api/google-login/`, {
                token: credentialResponse.credential
              });

              if (res.data.is_new_user) {
                // Redirect to Register with pre-filled details
                navigate('/register', {
                  state: {
                    email: res.data.email,
                    name: res.data.name
                  }
                });
              } else {
                login(res.data.user, res.data.token);
                if (res.data.user.role === 'admin') {
                  navigate('/admin-dashboard');
                } else {
                  navigate('/dashboard');
                }
              }
            } catch (err: any) {
              console.error("Google Login Error:", err);
              setError("Google Login Failed: " + (err.response?.data?.error || err.message));
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            console.log('Login Failed');
            setError("Google Login Failed");
          }}
        />
      </Box>
    </Box>
  );
};

export default LoginForm;