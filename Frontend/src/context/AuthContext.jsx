import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await api.get('/users/current-user');
      setUser(response.data.data);
    } catch (err) {
      setUser(null);
      console.error("Auth check failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await api.post('/users/login', credentials);
      const { user, accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      setError(null);
      const response = await api.post('/users/register', formData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      localStorage.removeItem('accessToken');
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const updateProfile = async (details) => {
    try {
      const response = await api.put('/users/update-account-details', details);
      setUser(response.data.data);
      return response.data;
    } catch (err) {
      console.error('Update profile failed:', err);
      throw err;
    }
  };

  const updateAvatar = async (formData) => {
    try {
      const response = await api.put('/users/update-avatar', formData);
      setUser(response.data.data);
      return response.data;
    } catch (err) {
      console.error('Update avatar failed:', err);
      throw err;
    }
  };

  const updatePassword = async (credentials) => {
    try {
      const response = await api.put('/users/update-password', credentials);
      return response.data;
    } catch (err) {
      console.error('Update password failed:', err);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    updateAvatar,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
