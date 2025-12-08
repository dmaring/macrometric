import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Diary from './pages/Diary';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder pages - will be implemented in later phases
const ForgotPassword = () => <div className="page"><h1>Reset Password</h1><p>Coming soon...</p></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route
          path="/diary"
          element={
            <ProtectedRoute>
              <Diary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/diary" replace />} />
        <Route path="*" element={<Navigate to="/diary" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
