import { Dashboard, Person, Psychology, People } from '@mui/icons-material';

import axios from 'axios';

export const API_BASE_URL = 'https://j411rvq5-8000.inc1.devtunnels.ms';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

export const NAV_ITEMS = [
    { label: 'Dashboard', path: '/dashboard', icon: Dashboard },
    { label: 'My Profile', path: '/profile', icon: Person },
    { label: 'Job Predictor', path: '/predictor', icon: Psychology },
    { label: 'Community', path: '/community', icon: People },
];
