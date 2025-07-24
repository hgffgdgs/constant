import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { NewReportScreen } from './components/reports/NewReportScreen';
import { ReportsListScreen } from './components/reports/ReportsListScreen';
import { ReportDetailScreen } from './components/reports/ReportDetailScreen';
import { AdministrationScreen } from './components/admin/AdministrationScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SyncIndicator } from './components/common/SyncIndicator';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roleHierarchy = { 'agent': 1, 'supervisor': 2, 'admin': 3 };
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy];
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy];
    
    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <OfflineIndicator />
      <SyncIndicator />
      
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginScreen />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/new-report" 
          element={
            <ProtectedRoute>
              <NewReportScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <ReportsListScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports/:id" 
          element={
            <ProtectedRoute>
              <ReportDetailScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/administration" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdministrationScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      <PWAInstallPrompt />
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Listen for PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Service Worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;