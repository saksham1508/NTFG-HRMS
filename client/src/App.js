import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { Helmet } from 'react-helmet-async';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/Common/LoadingScreen';




// Lazy load components for better performance
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const Employees = React.lazy(() => import('./pages/Employees/Employees'));
const Recruitment = React.lazy(() => import('./pages/Recruitment/Recruitment'));
const Performance = React.lazy(() => import('./pages/Performance/Performance'));
const MyGoals = React.lazy(() => import('./pages/Performance/MyGoals'));
const Leave = React.lazy(() => import('./pages/Leave/Leave'));
const Training = React.lazy(() => import('./pages/Training/Training'));
const AIInsights = React.lazy(() => import('./pages/AI/AIInsights'));
const Profile = React.lazy(() => import('./pages/Profile/Profile'));
const Settings = React.lazy(() => import('./pages/Settings/Settings'));
const NotFound = React.lazy(() => import('./pages/NotFound/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <CircularProgress size={40} />
  </Box>
);

// Protected Route component
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title>NTFG HRMS - AI-Powered Human Resource Management</title>
        <meta 
          name="description" 
          content="NextTechFusionGadgets AI-powered HRMS portal for efficient human resource management, recruitment, performance tracking, and employee development." 
        />
        <meta name="keywords" content="HRMS, AI, Human Resources, Employee Management, Recruitment, Performance, NextTechFusionGadgets" />
        <meta property="og:title" content="NTFG HRMS - AI-Powered HR Management" />
        <meta property="og:description" content="Streamline your HR processes with AI-powered insights and automation." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              // <ProtectedRoute>
                <Layout />
              // </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />

            {/* Employee Management */}
            <Route
              path="employees"
              element={
                <ProtectedRoute requiredPermission="view_employees">
                  <Suspense fallback={<PageLoader />}>
                    <Employees />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Recruitment */}
            <Route
              path="recruitment"
              element={
                // <ProtectedRoute requiredPermission="view_recruitment">
                  <Suspense fallback={<PageLoader />}>
                    <Recruitment />
                  </Suspense>
                // </ProtectedRoute>
              }
            />

            {/* Performance Management */}
            <Route
              path="performance"
              element={
                // <ProtectedRoute requiredPermission="view_performance">
                  <Suspense fallback={<PageLoader />}>
                    <Performance />
                  </Suspense>
                // </ProtectedRoute>
              }
            />
            <Route
              path="performance/my-goals"
              element={
                // <ProtectedRoute requiredPermission="view_performance">
                  <Suspense fallback={<PageLoader />}>
                    <MyGoals />
                  </Suspense>
                // </ProtectedRoute>
              }
            />
            <Route
              path="performance/goals"
              element={
                // <ProtectedRoute requiredPermission="view_performance">
                  <Suspense fallback={<PageLoader />}>
                    <MyGoals />
                  </Suspense>
                // </ProtectedRoute>
              }
            />

            {/* Leave Management */}
            <Route
              path="leave/*"
              element={
                // <ProtectedRoute requiredPermission="view_leave">
                  <Suspense fallback={<PageLoader />}>
                    <Leave />
                  </Suspense>
                // </ProtectedRoute>
              }
            />

            {/* Training & Development */}
            <Route
              path="training/*"
              element={
                // <ProtectedRoute requiredPermission="view_training">
                  <Suspense fallback={<PageLoader />}>
                    <Training />
                  </Suspense>
                // </ProtectedRoute>
              }
            />

            {/* AI Insights */}
            <Route
              path="ai-insights/*"
              element={
                // <ProtectedRoute requiredPermission="use_ai_features">
                  <Suspense fallback={<PageLoader />}>
                    <AIInsights />
                  </Suspense>
                // </ProtectedRoute>
              }
            />

            {/* Profile */}
            <Route
              path="profile"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Profile />
                </Suspense>
              }
            />

            {/* Settings */}
            <Route
              path="settings/*"
              element={
                <ProtectedRoute requiredPermission="manage_system">
                  <Suspense fallback={<PageLoader />}>
                    <Settings />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;