import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const NAVBAR_HEIGHT = 64; // px, export this for use in page padding

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const isStaffPage = location.pathname === '/staff';

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              cursor: 'pointer',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              '&:hover': {
                color: '#90CAF9',
              },
              transition: 'color 0.3s ease-in-out',
            }}
            onClick={() => navigate('/')}
          >
            MenuCoffee
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isLoggedIn ? (
            <>
              {user?.role === 'admin' && (
                <Button
                  color="inherit"
                  startIcon={<AdminIcon />}
                  onClick={() => navigate('/staff')}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {!isMobile && 'จัดการคำสั่งซื้อ'}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                เข้าสู่ระบบ
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                  },
                }}
              >
                สมัครสมาชิก
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 