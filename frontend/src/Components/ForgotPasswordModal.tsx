import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Box, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';

interface ForgotPasswordModalProps {
    open: boolean;
    onClose: () => void;
}

import { API_BASE_URL } from '../config';

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ open, onClose }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [timer, setTimer] = useState(120); // 2 minutes

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setError('OTP expired. Please request a new one.');
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleSendOTP = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await axios.post(`${API_BASE_URL}/api/auth/forgot-password/`, { email });
            setStep(2);
            setTimer(120);
            setMessage('OTP sent to your email.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_BASE_URL}/api/auth/verify-otp/`, { email, otp });
            setStep(3);
            setMessage('OTP verified. Set your new password.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_BASE_URL}/api/auth/reset-password/`, {
                email, otp, new_password: newPassword
            });
            setMessage('Password reset successful! You can now login.');
            setTimeout(() => {
                onClose();
                setStep(1);
                setEmail('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setMessage('');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                {step === 1 && 'Reset Password'}
                {step === 2 && 'Enter Verification Code'}
                {step === 3 && 'Set New Password'}
            </DialogTitle>
            <DialogContent>
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {step === 1 && (
                    <Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Enter your email address and we'll send you a verification code.
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Email Address"
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Box>
                )}

                {step === 2 && (
                    <Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Enter the 6-digit code sent to <strong>{email}</strong>
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="6-Digit OTP"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            inputProps={{ maxLength: 6, style: { fontSize: '24px', textAlign: 'center', letterSpacing: '10px' } }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center', color: timer < 30 ? 'error.main' : 'text.secondary' }}>
                            Time remaining: {formatTime(timer)}
                        </Typography>
                    </Box>
                )}

                {step === 3 && (
                    <Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Create a strong password for your account.
                        </Typography>
                        <TextField
                            margin="dense"
                            label="New Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>

                {step === 1 && (
                    <Button onClick={handleSendOTP} variant="contained" disabled={loading || !email}>
                        {loading ? <CircularProgress size={24} /> : 'Send Code'}
                    </Button>
                )}

                {step === 2 && (
                    <Button onClick={handleVerifyOTP} variant="contained" disabled={loading || otp.length !== 6}>
                        {loading ? <CircularProgress size={24} /> : 'Verify'}
                    </Button>
                )}

                {step === 3 && (
                    <Button onClick={handleResetPassword} variant="contained" disabled={loading || !newPassword}>
                        {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ForgotPasswordModal;
