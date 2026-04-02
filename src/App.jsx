import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingWhatsApp from './components/WhatsApp/FloatingWhatsApp';

// Public Pages
import Home from './pages/Public/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import InvitationPage from './pages/Public/InvitationPage';

// Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import CreateEvent from './pages/Dashboard/CreateEvent';
import EventDetails from './pages/Dashboard/EventDetails';
import GuestsManager from './pages/Guests/GuestsManager';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/invitation/:link" element={<InvitationPage />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
            <Route path="/events/:eventId" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
            <Route path="/events/:eventId/guests" element={<ProtectedRoute><GuestsManager /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
          <FloatingWhatsApp />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
