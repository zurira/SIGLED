import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Importación de Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import Verify2FAPage from './pages/Verify2FAPage';
import RecoverPage from './pages/RecoverPage';
import VerifyRecoveryPage from './pages/VerifyRecoveryPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const { autenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', color: '#101828', fontFamily: 'sans-serif' }}>
        <h3>Cargando sesión segura...</h3>
      </div>
    );
  }

  return autenticado ? children : <Navigate to="/login" replace />;
};

// Componente para proteger rutas públicas (evita que un usuario logueado vaya a login/registro)
const PublicRoute = ({ children }) => {
  const { autenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', color: '#101828', fontFamily: 'sans-serif' }}>
        <h3>Cargando sesión segura...</h3>
      </div>
    );
  }

  return !autenticado ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas (no autenticadas) */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/registro" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/verificar-cuenta" element={<PublicRoute><VerifyAccountPage /></PublicRoute>} />
          <Route path="/verificar-2fa" element={<PublicRoute><Verify2FAPage /></PublicRoute>} />
          <Route path="/recuperar" element={<PublicRoute><RecoverPage /></PublicRoute>} />
          <Route path="/verificar-recuperacion" element={<PublicRoute><VerifyRecoveryPage /></PublicRoute>} />
          <Route path="/resetear-contrasena" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

          {/* Rutas Privadas (protegidas) */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
