import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

// إنشاء Context
const AuthContext = createContext();

// Hook مخصص للاستخدام
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await API.auth.getMe();
      setUser(response.user);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await API.auth.register(userData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await API.auth.login(email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// تصدير AuthContext للاستخدام في useAuth
export { AuthContext };
