import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('careersync_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('careersync_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            // Preserve role from the stored user (comes from JWT/login response)
            const storedRole = user?.role;
            const updatedUser = { 
              ...res.data.profile, 
              role: storedRole || res.data.profile.role || 'Student'
            };
            setUser(updatedUser);
            localStorage.setItem('careersync_user', JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.warn('Session verification failed, resetting auth');
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('careersync_token', userToken);
    localStorage.setItem('careersync_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('careersync_token');
    localStorage.removeItem('careersync_user');
  };

  const updateUserProfile = (newProfileData) => {
    const updated = { ...user, ...newProfileData };
    setUser(updated);
    localStorage.setItem('careersync_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserProfile }}>
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
