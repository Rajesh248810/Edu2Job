import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Paper,
  Alert, CircularProgress, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Divider, Chip, MenuItem
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../api';
import { useAuth } from '../auth/AuthContext';
import { DEGREES, SPECIALIZATIONS } from '../data/profileOptions';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';
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
  const [activeSection, setActiveSection] = useState<'education' | 'certification' | 'skill' | 'placement' | 'password'>('education');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [eduData, setEduData] = useState<EducationData>({
    degree: '', specialization: '', university: '', cgpa: '', year_of_completion: ''
  });
  const [certData, setCertData] = useState<CertificationData>({
    cert_name: '', issuing_organization: '', issue_date: ''
  });
  const [skillData, setSkillData] = useState<{ skill_name: string }>({ skill_name: '' });
  const [placementData, setPlacementData] = useState<PlacementData>({
    role: '', company: '', placement_type: 'Job', date_of_joining: ''
  });
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });

  // Reset form when switching sections
  useEffect(() => {
    setMessage(null);
    setEditingId(null);
    setEduData({ degree: '', specialization: '', university: '', cgpa: '', year_of_completion: '' });
    setCertData({ cert_name: '', issuing_organization: '', issue_date: '' });
    setSkillData({ skill_name: '' });
    setPlacementData({ role: '', company: '', placement_type: 'Job', date_of_joining: '' });
    setPasswordData({ password: '', confirmPassword: '' });
  }, [activeSection]);

  // Force refresh user data on mount to ensure IDs are present
  useEffect(() => {
    refreshUser();
  }, []);

  // Handle Input Changes
  const handleEduChange = (e: React.ChangeEvent<HTMLInputElement>) => setEduData({ ...eduData, [e.target.name]: e.target.value });
  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => setCertData({ ...certData, [e.target.name]: e.target.value });

  const handlePlacementChange = (e: React.ChangeEvent<HTMLInputElement>) => setPlacementData({ ...placementData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  // Populate form for editing
  const handleEdit = (item: any, type: 'education' | 'certification' | 'placement') => {
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

  // Delete Handler
  const handleDelete = async (id: number, type: 'education' | 'certification' | 'skill' | 'placement') => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    try {
      await api.delete(`/api/${type}/${id}/`);
      setMessage({ type: 'success', text: 'Item deleted successfully!' });
      refreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete item.' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!user?.user_id) throw new Error('User not authenticated');

      let response;
      if (activeSection === 'education') {
        const payload = { user_id: user.user_id, ...eduData };
        if (editingId) {
          response = await api.put(`/api/education/${editingId}/`, payload);
        } else {
          response = await api.post(`/api/education/`, payload);
        }
      } else if (activeSection === 'certification') {
        const payload = { user_id: user.user_id, ...certData };
        if (editingId) {
          response = await api.put(`/api/certification/${editingId}/`, payload);
        } else {
          response = await api.post(`/api/certification/`, payload);
        }
      } else if (activeSection === 'skill') {
        const payload = { user_id: user.user_id, ...skillData };
        response = await api.post(`/api/skill/`, payload);
      } else if (activeSection === 'placement') {
        const payload = { user_id: user.user_id, ...placementData };
        if (editingId) {
          response = await api.put(`/api/placement/${editingId}/`, payload);
        } else {
          response = await api.post(`/api/placement/`, payload);
        }
      } else if (activeSection === 'password') {
        if (passwordData.password !== passwordData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        response = await api.post(`/api/set-password/`, { password: passwordData.password });
      }

      if (response && (response.status === 200 || response.status === 201)) {
        setMessage({ type: 'success', text: 'Saved successfully!' });
        setEditingId(null);
        // Reset forms
        setEduData({ degree: '', specialization: '', university: '', cgpa: '', year_of_completion: '' });
        setCertData({ cert_name: '', issuing_organization: '', issue_date: '' });
        setSkillData({ skill_name: '' });
        setPlacementData({ role: '', company: '', placement_type: 'Job', date_of_joining: '' });
        setPasswordData({ password: '', confirmPassword: '' });
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

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4, borderRadius: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
        Manage Profile
      </Typography>

      {/* Navigation Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {['education', 'certification', 'skill', 'placement', 'password'].map((section) => (
          <Button
            key={section}
            variant={activeSection === section ? 'contained' : 'outlined'}
            onClick={() => setActiveSection(section as any)}
            sx={{ textTransform: 'capitalize' }}
          >
            {section === 'placement' ? 'Placement Status' : section}
          </Button>
        ))}
      </Box>

      {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

      {/* Existing Items List */}
      {activeSection !== 'password' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            Existing {activeSection === 'placement' ? 'Placements' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1) + 's'}
          </Typography>
          <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #eee' }}>
            {activeSection === 'education' && user?.education?.map((edu: any) => (
              <React.Fragment key={edu.education_id}>
                <ListItem>
                  <ListItemText
                    primary={`${edu.degree} in ${edu.specialization}`}
                    secondary={`${edu.university} (${edu.year_of_completion})`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleEdit(edu, 'education')} sx={{ mr: 1 }}><EditIcon /></IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(edu.education_id, 'education')}><DeleteIcon /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {activeSection === 'certification' && user?.certifications?.map((cert: any) => (
              <React.Fragment key={cert.cert_id}>
                <ListItem>
                  <ListItemText
                    primary={cert.cert_name}
                    secondary={`${cert.issuing_organization} - ${cert.issue_date}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleEdit(cert, 'certification')} sx={{ mr: 1 }}><EditIcon /></IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(cert.cert_id, 'certification')}><DeleteIcon /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {activeSection === 'skill' && (
              <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {user?.skills?.map((skill: any) => (
                  <Chip
                    key={skill.skill_id}
                    label={skill.skill_name}
                    onDelete={() => handleDelete(skill.skill_id, 'skill')}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
            {activeSection === 'placement' && user?.placements?.map((placement: any) => (
              <React.Fragment key={placement.placement_id}>
                <ListItem>
                  <ListItemText
                    primary={`${placement.role} at ${placement.company}`}
                    secondary={`${placement.placement_type} - Joined: ${placement.date_of_joining}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleEdit(placement, 'placement')} sx={{ mr: 1 }}><EditIcon /></IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(placement.placement_id, 'placement')}><DeleteIcon /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Add / Edit Form */}
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
        {editingId ? 'Edit Item' : activeSection === 'password' ? 'Change Password' : 'Add New Item'}
      </Typography>

      <form onSubmit={handleSubmit}>
        {activeSection === 'education' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <AsyncAutocomplete
                label="Degree"
                value={eduData.degree}
                onChange={(val) => setEduData({ ...eduData, degree: val || '' })}
                staticOptions={DEGREES}
                required={!eduData.degree}
              />
              <AsyncAutocomplete
                label="Specialization"
                value={eduData.specialization}
                onChange={(val) => setEduData({ ...eduData, specialization: val || '' })}
                staticOptions={SPECIALIZATIONS}
                required={!eduData.specialization}
              />
            </Box>
            <GooglePlacesAutocomplete
              value={eduData.university}
              onChange={(newValue) => {
                setEduData({ ...eduData, university: newValue || '' });
              }}
              onInputChange={(newInputValue) => {
                setEduData({ ...eduData, university: newInputValue });
              }}
              label="University"
              required={!eduData.university}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField sx={{ flex: 1 }} label="CGPA" name="cgpa" type="number" inputProps={{ step: "0.01" }} value={eduData.cgpa} onChange={handleEduChange} required />
              <TextField sx={{ flex: 1 }} label="Year" name="year_of_completion" type="number" value={eduData.year_of_completion} onChange={handleEduChange} required />
            </Box>
          </Box>
        )}

        {activeSection === 'certification' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AsyncAutocomplete
              label="Certification Name"
              value={certData.cert_name}
              onChange={(val) => setCertData({ ...certData, cert_name: val || '' })}
              staticOptions={[]} // Pass empty list or specific cert list if available
              required={!certData.cert_name}
            />
            <AsyncAutocomplete
              label="Organization"
              value={certData.issuing_organization}
              onChange={(val) => setCertData({ ...certData, issuing_organization: val || '' })}
              staticOptions={[]}
              required={!certData.issuing_organization}
            />
            <TextField fullWidth label="Date" name="issue_date" type="date" InputLabelProps={{ shrink: true }} value={certData.issue_date} onChange={handleCertChange} required />
          </Box>
        )}

        {activeSection === 'skill' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AsyncAutocomplete
              label="Skill Name"
              value={skillData.skill_name}
              onChange={(val) => setSkillData({ ...skillData, skill_name: val || '' })}
              staticOptions={[]} // Could add common skills list here
              required={!skillData.skill_name}
            />
          </Box>
        )}

        {activeSection === 'placement' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AsyncAutocomplete
              label="Role / Job Title"
              value={placementData.role}
              onChange={(val) => setPlacementData({ ...placementData, role: val || '' })}
              staticOptions={[]}
              required={!placementData.role}
            />
            <AsyncAutocomplete
              label="Company Name"
              value={placementData.company}
              onChange={(val) => setPlacementData({ ...placementData, company: val || '' })}
              staticOptions={[]}
              required={!placementData.company}
            />
            <TextField select fullWidth label="Type" name="placement_type" value={placementData.placement_type} onChange={handlePlacementChange} required>
              <MenuItem value="Job">Job</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
            </TextField>
            <TextField fullWidth label="Date of Joining" name="date_of_joining" type="date" InputLabelProps={{ shrink: true }} value={placementData.date_of_joining} onChange={handlePlacementChange} required />
          </Box>
        )}

        {activeSection === 'password' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="New Password" name="password" type="password" value={passwordData.password} onChange={handlePasswordChange} required />
            <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
          </Box>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {editingId && (
            <Button variant="outlined" onClick={() => {
              setEditingId(null);
              setEduData({ degree: '', specialization: '', university: '', cgpa: '', year_of_completion: '' });
              setCertData({ cert_name: '', issuing_organization: '', issue_date: '' });
              setPlacementData({ role: '', company: '', placement_type: 'Job', date_of_joining: '' });
            }}>
              Cancel Edit
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: 150 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (editingId ? 'Update' : 'Save')}
          </Button>
        </Box>
      </form>
    </Paper >
  );
};

export default ProfileForm;