import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress } from '@mui/material';

// Layouts
import Layout from './Components/Layout';
import DashboardLayout from './Components/DashboardLayout';
import ProtectedRoute from './auth/ProtectedRoute';

// Lazy Load Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const JobPredictor = lazy(() => import('./pages/JobPredictor'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Router>
      <CssBaseline />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes - Uses Standard Header/Footer */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<HomePage />} />
            <Route path="/register" element={<HomePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Route>

          {/* Protected App Routes - Uses Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="/predictor" element={<JobPredictor />} />
              <Route path="/community" element={<CommunityPage />} />
            </Route>

            {/* Admin Dashboard - Standalone Layout */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;