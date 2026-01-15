import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/ui/Layout";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import UploadPage from "../pages/UploadPage";
import DashboardPage from "../pages/DashboardPage";
import GameHistoryPage from "../pages/GameHistoryPage";
import AnalysisPage from "../pages/AnalysisPage";
import { AuthProvider, useAuth } from "../context/AuthContext";

function AuthenticatedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/upload" replace />;
  return children;
}

function AppContent() {
  const { logout, user } = useAuth();

  return (
    <Layout isAuthenticated={!!user} onLogout={logout}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Private Routes */}
        <Route path="/upload" element={<AuthenticatedRoute><UploadPage /></AuthenticatedRoute>} />
        <Route path="/analysis" element={<AuthenticatedRoute><AnalysisPage /></AuthenticatedRoute>} />
        <Route path="/dashboard" element={<AuthenticatedRoute><DashboardPage /></AuthenticatedRoute>} />
        <Route path="/history" element={<AuthenticatedRoute><GameHistoryPage /></AuthenticatedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
