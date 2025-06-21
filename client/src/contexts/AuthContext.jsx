import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || '');

  useEffect(() => {
    // ตรวจสอบ token เมื่อโหลดแอพครั้งแรก
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (storedToken && storedRefreshToken) {
      // ตรวจสอบว่า token หมดอายุหรือไม่
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp > currentTime) {
          // Token ยังไม่หมดอายุ
          setIsLoggedIn(true);
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
        } else {
          // Token หมดอายุแล้ว ลองใช้ refresh token
          refreshAccessToken(storedRefreshToken);
        }
      } catch (error) {
        // Token ไม่ถูกต้อง ลบออก
        logout();
      }
    }
  }, []);

  // ฟังก์ชันสำหรับ refresh token
  const refreshAccessToken = async (refreshTokenValue) => {
    try {
      const response = await fetch('http://localhost:5000/api/staff/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token;
        
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