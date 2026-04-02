import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

export const AuthContext = createContext();

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

  const register = useCallback(async (userData) => {
    try {
      const response = await API.auth.register(userData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      setError(err.message || 'فشل إنشاء الحساب');
      return { success: false, error: err.message };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await API.auth.login(email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول');
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await API.auth.updateProfile(data);
      setUser(prev => ({ ...prev, ...response.user }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
