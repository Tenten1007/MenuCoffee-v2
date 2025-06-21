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
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (storedToken && storedRefreshToken) {
        try {
          // You might want to verify the token with the backend here
          // For simplicity, we'll just set the user as logged in
          const response = await api.post('/api/staff/refresh-token', { refreshToken: storedRefreshToken });
          if (response.data && response.data.token) {
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setIsLoggedIn(true);
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
  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      logout();
      return;
    }

    try {
      const response = await api.post('/api/staff/refresh-token', {
        refreshToken: storedRefreshToken,
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
        refreshAccessToken();
      }
      
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const login = (newToken, newRefreshToken) => {
    localStorage.setItem('token', newToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
      setRefreshToken(newRefreshToken);
    }
    setToken(newToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken('');
    setRefreshToken('');
    setIsLoggedIn(false);
    // Redirect to home page after logout
    window.location.href = '/';
  };

  // ตรวจสอบ token ทุก 1 นาที
  useEffect(() => {
    let interval;
    if (isLoggedIn && token) {
      interval = setInterval(() => {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        // Refresh if token expires in the next 5 minutes
        if (payload.exp - currentTime < 300) {
          refreshAccessToken();
        } else if (payload.exp < currentTime) {
          // Logout if token is already expired
          logout();
        }
      }, 60000); // Check every 60 seconds
    }
    return () => clearInterval(interval);
  }, [isLoggedIn, token]);

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