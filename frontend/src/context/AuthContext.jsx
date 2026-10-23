import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'signup'
  const [pendingAction, setPendingAction] = useState(null); // Callback or redirect after login

  const openAuthModal = useCallback((tab = 'login', onComplete = null) => {
    setAuthModalTab(tab);
    setPendingAction(() => onComplete);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  }, []);

  // Fetch current user on mount or token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Failed to verify existing session token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    if (data.token) {
      localStorage.setItem('imovies_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      if (pendingAction && typeof pendingAction === 'function') {
        pendingAction(data.user);
        setPendingAction(null);
      }
    }
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await api.auth.register(name, email, password);
    if (data.token) {
      localStorage.setItem('imovies_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      if (pendingAction && typeof pendingAction === 'function') {
        pendingAction(data.user);
        setPendingAction(null);
      }
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const data = await api.auth.updateProfile(payload);
    if (data.success && data.user) {
      setUser((prev) => ({ ...prev, ...data.user }));
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        signup,
        logout,
        updateProfile,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
