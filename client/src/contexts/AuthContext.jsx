import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // You might want to verify the token with the backend here
          // For simplicity, we'll just set the user as logged in
          const response = await api.post('/api/staff/refresh-token');
          if (response.data.token) {
            login(response.data.token);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Session check failed", error);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // ฟังก์ชันสำหรับ refresh token
  const refreshAccessToken = async (refreshTokenValue) => {
    try {
      const response = await api.post('/api/staff/refresh-token', {
        refreshToken: refreshTokenValue,
      });

      if (response.data && response.data.token) {
        const newToken = response.data.token;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setIsLoggedIn(true);
      } else {
        // Refresh token หมดอายุแล้ว
        logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  // ฟังก์ชันสำหรับตรวจสอบ token expiration
  const checkTokenExpiration = () => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // ถ้า token จะหมดอายุใน 5 นาที ให้ refresh
      if (payload.exp - currentTime < 300) {
        refreshAccessToken(refreshToken);
      }
      
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const login = (newToken, newRefreshToken) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken('');
    setRefreshToken('');
    setIsLoggedIn(false);
  };

  // ตรวจสอบ token ทุก 1 นาที
  useEffect(() => {
    if (isLoggedIn && token) {
      const interval = setInterval(() => {
        if (!checkTokenExpiration()) {
          logout();
        }
      }, 60000); // ตรวจสอบทุก 1 นาที

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token, refreshToken]);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      login, 
      logout, 
      token, 
      refreshToken,
      refreshAccessToken 
    }}>
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