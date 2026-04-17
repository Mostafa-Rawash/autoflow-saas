import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/authStore";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardTest from "./pages/DashboardTest";
import Conversations from "./pages/Conversations";
import ConversationDetail from "./pages/ConversationDetail";
import Templates from "./pages/Templates";
import Channels from "./pages/Channels";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import Subscription from "./pages/Subscription";
import WhatsAppConnect from "./pages/WhatsAppConnect";
import AutoReplies from "./pages/AutoReplies";
import Onboarding from "./pages/Onboarding";
import SystemHealth from "./pages/SystemHealth";

// Admin Pages
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
} from "./pages/admin";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  const hasToken = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="min-h-screen bg-light-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route (requires admin/owner/manager role)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  const hasToken = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="min-h-screen bg-light-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  // Only allow owner, admin, or manager roles
  const allowedRoles = ['owner', 'admin', 'manager'];
  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen bg-light-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  const hasToken = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="min-h-screen bg-light-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (hasToken) {
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
            background: "#ffffff",
            color: "#171717",
            border: "1px solid #e5e5e5",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="conversations/:id" element={<ConversationDetail />} />
          <Route path="templates" element={<Templates />} />
          <Route path="channels" element={<Channels />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="team" element={<Team />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="auto-replies" element={<AutoReplies />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="system-health" element={<SystemHealth />} />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="admin/roles"
            element={
              <AdminRoute>
                <AdminRoles />
              </AdminRoute>
            }
          />
          <Route
            path="admin/articles"
            element={
              <AdminRoute>
                <AdminArticles />
              </AdminRoute>
            }
          />
          <Route
            path="admin/docs"
            element={
              <AdminRoute>
                <AdminDocs />
              </AdminRoute>
            }
          />
          <Route
            path="admin/subscriptions"
            element={
              <AdminRoute>
                <AdminSubscriptions />
              </AdminRoute>
            }
          />
          <Route
            path="admin/invoices"
            element={
              <AdminRoute>
                <AdminInvoices />
              </AdminRoute>
            }
          />
          <Route
            path="admin/logs"
            element={
              <AdminRoute>
                <AdminActivityLogs />
              </AdminRoute>
            }
          />
          <Route
            path="admin/system-logs"
            element={
              <AdminRoute>
                <AdminLogs />
              </AdminRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
