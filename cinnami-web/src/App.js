import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Screens y componentes principales
import LoginScreen from './screens/LoginScreen';
import AdminHomeScreen from './screens/admin/AdminHomeScreen';
import DoorStatusScreen from './screens/admin/DoorStatusScreen';
import ManageCardsScreen from './screens/admin/ManageCardsScreen';
import ManageUsersScreen from './screens/admin/ManageUsersScreen';
import ManageDoorsScreen from './screens/admin/ManageDoorsScreen';
import UserHomeScreen from './screens/user/UserHomeScreen';
import CardStatusScreen from './screens/user/CardStatusScreen';
import AccessHistoryScreen from './screens/user/AccessHistoryScreen';
import ProtectedRoute from './navigation/ProtectedRoute';
import ModalLogout from './components/logout/ModalLogout';

// Toastify import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pantallas de recuperación
import ForgotPasswordScreen from './screens/user/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/user/ResetPasswordScreen';

// Loader global
import { useLoader } from './context/LoaderContext';
import CinnamiLoader from './components/CinnamiLoader/CinnamiLoader';

// Wrapper para LoginScreen que tiene acceso a useNavigate
function LoginWrapper({ setRole }) {
  const navigate = useNavigate();
  return <LoginScreen setRole={setRole} navigate={navigate} />;
}

// Overlay global para mostrar el loader en cualquier lugar
function LoaderOverlayGlobal() {
  const { isLoading, loaderText } = useLoader();
  return isLoading ? <CinnamiLoader text={loaderText} /> : null;
}

function App() {
  const [logoutModal, setLogoutModal] = useState(false);
  const [role, setRole] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();

  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    setRole(savedRole);
  }, []);

  // Logout con loader
  const handleLogout = () => {
    showLoader("Cerrando sesión...");
    setTimeout(() => {
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setRole(null);
      setLogoutModal(false);
      hideLoader();
      navigate('/'); // Usar navigate ya que tienes Router en index.js
    }, 1200);
  };

  return (
    <>
      {/* Loader global superpuesto */}
      <LoaderOverlayGlobal />

      <Routes>
        {/* Login */}
        <Route path="/" element={<LoginWrapper setRole={setRole} />} />

        {/* Rutas públicas de recuperación */}
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminHomeScreen onLogoutClick={() => setLogoutModal(true)} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doors"
          element={
            <ProtectedRoute allowedRole="admin">
              <DoorStatusScreen onLogoutClick={() => setLogoutModal(true)} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cards"
          element={
            <ProtectedRoute allowedRole="admin">
              <ManageCardsScreen onLogoutClick={() => setLogoutModal(true)} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="admin">
              <ManageUsersScreen onLogoutClick={() => setLogoutModal(true)} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-doors"
          element={
            <ProtectedRoute allowedRole="admin">
              <ManageDoorsScreen onLogoutClick={() => setLogoutModal(true)} />
            </ProtectedRoute>
          }
        />

        {/* Docente routes */}
        <Route
          path="/docente"
          element={
            <ProtectedRoute allowedRole="docente">
              <UserHomeScreen onLogoutClick={() => setLogoutModal(true)} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docente/cards"
          element={
            <ProtectedRoute allowedRole="docente">
              <CardStatusScreen onLogoutClick={() => setLogoutModal(true)} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docente/history"
          element={
            <ProtectedRoute allowedRole="docente">
              <AccessHistoryScreen onLogoutClick={() => setLogoutModal(true)} />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Modal logout global */}
      <ModalLogout
        visible={logoutModal}
        onCancel={() => setLogoutModal(false)}
        onConfirm={handleLogout}
      />

      {/* Toastify container global */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ fontFamily: 'inherit', zIndex: 9999 }}
      />
    </>
  );
}

export default App;
