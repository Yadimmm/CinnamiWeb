import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

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

// Componente wrapper para LoginScreen que tiene acceso a useNavigate
function LoginWrapper({ setRole }) {
  const navigate = useNavigate();
  return <LoginScreen setRole={setRole} navigate={navigate} />;
}

function App() {
  const [logoutModal, setLogoutModal] = useState(false);
  // Solo para refrescar la UI después de login/logout
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Mantén este efecto solo para actualizar la UI después de login/logout
    const savedRole = localStorage.getItem('role');
    setRole(savedRole); // No lo pases a ProtectedRoute, solo para refresco visual
  }, []);

  // logout: limpia localStorage y recarga (te regresa a login)
  const handleLogout = () => {
    localStorage.removeItem('role');
    setRole(null);
    setLogoutModal(false);
    window.location.href = '/';
  };

  return (
    <>
      <Router>
        <Routes>
          {/* Login */}
          <Route path="/" element={<LoginWrapper setRole={setRole} />} />

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
      </Router>

      {/* Modal logout global */}
      <ModalLogout
        visible={logoutModal}
        onCancel={() => setLogoutModal(false)}
        onConfirm={handleLogout}
      />

      {/* Toastify container global para alertas bonitas */}
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
