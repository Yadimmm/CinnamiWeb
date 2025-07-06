import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importar pantallas
import LoginScreen from '../screens/user/LoginScreen';

// Admin
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import DoorStatusScreen from '../screens/admin/DoorStatusScreen';
import ManageCardsScreen from '../screens/admin/ManageCardsScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ManageDoorsScreen from '../screens/admin/ManageDoorsScreen';

// User
import UserHomeScreen from '../screens/user/UserHomeScreen';
import CardStatusScreen from '../screens/user/CardStatusScreen';
import AccessHistoryScreen from '../screens/user/AccessHistoryScreen';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<LoginScreen />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminHomeScreen />} />
        <Route path="/admin/doors" element={<DoorStatusScreen />} />
        <Route path="/admin/cards" element={<ManageCardsScreen />} />
        <Route path="/admin/users" element={<ManageUsersScreen />} />
        <Route path="/admin/manage-doors" element={<ManageDoorsScreen />} />

        {/* User */}
        <Route path="/user" element={<UserHomeScreen />} />
        <Route path="/user/cards" element={<CardStatusScreen />} />
        <Route path="/user/history" element={<AccessHistoryScreen />} />
      </Routes>
    </Router>
  );
}
