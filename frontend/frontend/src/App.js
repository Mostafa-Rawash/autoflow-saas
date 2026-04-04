import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import ConversationDetail from './pages/ConversationDetail';
import Templates from './pages/Templates';
import Channels from './pages/Channels';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Subscription from './pages/Subscription';
import WhatsAppConnect from './pages/WhatsAppConnect';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { fetchUser } = useAuthStore();

  // Restore session on app load (always logged in)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#202123',
            color: '#fff',
            border: '1px solid #343541'
          }
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="conversations/:id" element={<ConversationDetail />} />
          <Route path="templates" element={<Templates />} />
          <Route path="channels" element={<Channels />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="team" element={<Team />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;