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
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon,
  LocalCafe as CoffeeIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const NAVBAR_HEIGHT = 64; // px, export this for use in page padding

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
    setMobileOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isStaffPage = location.pathname === '/staff';

  const menuItems = [
    { text: 'หน้าแรก', icon: <HomeIcon />, path: '/' },
    ...(isLoggedIn ? [
      { text: 'เมนู', icon: <CoffeeIcon />, path: '/menu' },
      { text: 'จัดการคำสั่งซื้อ', icon: <AdminIcon />, path: '/staff' },
      { text: 'ประวัติคำสั่งซื้อ', icon: <HistoryIcon />, path: '/order-history' }
    ] : [])
  ];

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Typography
        variant="h6"
        sx={{
          px: 2,
          py: 1,
          color: 'primary.main',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        คุณย่า Coffee
      </Typography>
      <Divider sx={{ my: 2 }} />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            {...(typeof ListItem.muiName === 'string' ? { button: true } : {})}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(.4,2,.3,1)',
              '&:hover': {
                background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)',
                color: '#222',
                transform: 'scale(1.04)',
                boxShadow: '0 2px 12px 0 rgba(255,215,0,0.18)',
                '& .MuiListItemIcon-root': {
                  color: '#FFA000',
                  transform: 'rotate(-8deg) scale(1.15)',
                  transition: 'all 0.18s cubic-bezier(.4,2,.3,1)'
                }
              },
              '&.Mui-selected': {
                background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)',
                color: '#222',
                fontWeight: 'bold',
                '& .MuiListItemIcon-root': {
                  color: '#FFD700'
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {isLoggedIn && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem {...(typeof ListItem.muiName === 'string' ? { button: true } : {})} onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="ออกจากระบบ" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant={isMobile ? "h6" : "h5"}
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
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
              }}
              onClick={() => navigate('/')}
            >
              คุณย่า Coffee
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isLoggedIn ? (
                <>
                  {menuItems.slice(1).map((item) => (
                    <Button
                      key={item.text}
                      color={location.pathname === item.path ? 'primary' : 'inherit'}
                      startIcon={item.icon}
                      onClick={() => navigate(item.path)}
                      sx={{
                        fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                        color: location.pathname === item.path ? '#FFD700' : 'white',
                        background: location.pathname === item.path ? 'rgba(255,215,0,0.08)' : 'none',
                        borderRadius: 2,
                        px: 2,
                        mx: 0.5,
                        '&:hover': {
                          background: 'rgba(255,215,0,0.15)',
                          color: '#FFD700',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                  <IconButton
                    color="inherit"
                    onClick={handleMenu}
                    sx={{ ml: 1 }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      ออกจากระบบ
                    </MenuItem>
                  </Menu>
                </>
              ) : null}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            backgroundColor: 'background.paper',
            borderRight: '1px solid rgba(255, 255, 255, 0.12)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 