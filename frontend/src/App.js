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
import AutoReplies from './pages/AutoReplies';
import Onboarding from './pages/Onboarding';
import SystemHealth from './pages/SystemHealth';
import Agents from './pages/Agents';
import Prompts from './pages/Prompts';
import Tools from './pages/Tools';
import Knowledge from './pages/Knowledge';
import Feedback from './pages/Feedback';

import {
  AdminDashboard,
  AdminArticles,
  AdminDocs,
  AdminUsers,
  AdminRoles,
  AdminSubscriptions,
  AdminInvoices,
  AdminActivityLogs,
  AdminLogs,
} from './pages/admin';

const ProtectedRoute = ({ children }) => {
  const hasToken = localStorage.getItem('token');
  if (!hasToken) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  const hasToken = localStorage.getItem('token');
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!hasToken) return <Navigate to="/login" replace />;
  const allowedRoles = ['owner', 'admin', 'manager'];
  if (!allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { loading } = useAuthStore();
  const hasToken = localStorage.getItem('token');
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (hasToken) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { fetchUser } = useAuthStore();
  useEffect(() => { fetchUser(); }, [fetchUser]);
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={localStorage.getItem('autoflow_onboarded') === 'true' ? <Dashboard /> : <Navigate to="/onboarding" replace />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="conversations/:id" element={<ConversationDetail />} />
          <Route path="agents" element={<Agents />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="prompts" element={<Prompts />} />
          <Route path="tools" element={<Tools />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="templates" element={<Templates />} />
          <Route path="channels" element={<Channels />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="team" element={<Team />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="auto-replies" element={<AutoReplies />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="system-health" element={<SystemHealth />} />
          <Route path="whatsapp-connect" element={<WhatsAppConnect />} />
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="admin/roles" element={<AdminRoute><AdminRoles /></AdminRoute>} />
          <Route path="admin/articles" element={<AdminRoute><AdminArticles /></AdminRoute>} />
          <Route path="admin/docs" element={<AdminRoute><AdminDocs /></AdminRoute>} />
          <Route path="admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
          <Route path="admin/invoices" element={<AdminRoute><AdminInvoices /></AdminRoute>} />
          <Route path="admin/logs" element={<AdminRoute><AdminActivityLogs /></AdminRoute>} />
          <Route path="admin/system-logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
