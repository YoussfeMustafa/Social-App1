import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('social_auth_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('social_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Helper to persist auth state
  const setAuthSession = useCallback((newToken, newUser) => {
    if (newToken) {
      localStorage.setItem('social_auth_token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('social_auth_token');
      setToken(null);
    }

    if (newUser) {
      localStorage.setItem('social_auth_user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      localStorage.removeItem('social_auth_user');
      setUser(null);
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    setAuthSession(null, null);
    window.location.href = '/login';
  }, [setAuthSession]);

  // Refresh profile from server
  const refreshProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('social_auth_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await authApi.getMyProfile();
      if (response?.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('social_auth_user', JSON.stringify(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      console.warn('Failed to refresh profile:', error);
      if (error?.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [logout]);

  // Initial load: verify token and load user
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('social_auth_token');
      if (storedToken) {
        await refreshProfile();
      } else {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen to unauthorized event from axios interceptor
    const handleUnauthorized = () => {
      setAuthSession(null, null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [refreshProfile, setAuthSession]);

  // Login
  const login = async (credentials) => {
    const response = await authApi.signin(credentials);
    const resToken = response?.data?.token || response?.token;
    const resUser = response?.data?.user || response?.user;

    if (resToken && resUser) {
      setAuthSession(resToken, resUser);
    }
    return response;
  };

  // Signup
  const signup = async (userData) => {
    const response = await authApi.signup(userData);
    const resToken = response?.data?.token || response?.token;
    const resUser = response?.data?.user || response?.user;

    // If signup returns token and user directly, authenticate the user
    if (resToken && resUser) {
      setAuthSession(resToken, resUser);
    }
    return response;
  };

  // Update profile photo
  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await authApi.uploadPhoto(formData);
    // After photo upload, refresh current profile
    await refreshProfile();
    return response;
  };

  // Change password
  const changePassword = async (passwords) => {
    const response = await authApi.changePassword(passwords);
    const newToken = response?.data?.token || response?.token;
    if (newToken) {
      localStorage.setItem('social_auth_token', newToken);
      setToken(newToken);
    }
    return response;
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token && user),
    login,
    signup,
    logout,
    refreshProfile,
    uploadPhoto,
    changePassword,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
