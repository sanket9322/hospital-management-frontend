import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <PrivateRoute role="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/doctor" element={
            <PrivateRoute role="DOCTOR">
              <DoctorDashboard />
            </PrivateRoute>
          } />
          <Route path="/patient" element={
            <PrivateRoute role="PATIENT">
              <PatientDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;