import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Badge,
  DialogContentText,
  CardActions
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  LocalCafe as CoffeeIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Done as DoneIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  MenuBook as MenuBookIcon,
  Logout as LogoutIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

const Staff = () => {
  const [orders, setOrders] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    fetchOrders();

    const socket = io('http://localhost:5000');

    socket.on('newOrder', (newOrder) => {
      console.log('New order received:', newOrder);
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    socket.on('updateOrder', (updatedOrder) => {
      console.log('Order updated:', updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    });

    socket.on('deleteOrder', (deletedOrderId) => {
      console.log('Order deleted:', deletedOrderId);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== deletedOrderId)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }

      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        console.log('Orders fetched from server:', data);
        setOrders(data);
      } else {
        console.error('Invalid data format:', data);
        setOrders([]);
        setSnackbar({
          open: true,
          message: 'Invalid data format received from server',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setSnackbar({
        open: true,
        message: 'Failed to fetch orders',
        severity: 'error'
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }

      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'อัปเดตสถานะคำสั่งซื้อสำเร็จ',
          severity: 'success'
        });
      } else {
        throw new Error('อัปเดตสถานะคำสั่งซื้อไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbar({
        open: true,
        message: 'อัปเดตสถานะคำสั่งซื้อไม่สำเร็จ',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอดำเนินการ':
        return '#FFC107';
      case 'กำลังทำ':
        return '#2196F3';
      case 'เสร็จสิ้น':
        return '#4CAF50';
      case 'ยกเลิก':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'รอดำเนินการ':
        return <TimerIcon fontSize="small" />;
      case 'กำลังทำ':
        return <CoffeeIcon fontSize="small" />;
      case 'เสร็จสิ้น':
        return <CheckCircleIcon fontSize="small" />;
      case 'ยกเลิก':
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const formatTime = (dateString) => {
    let date = new Date(dateString);

    if (isNaN(date.getTime()) && typeof dateString === 'string') {
      const isoString = dateString.replace(' ', 'T');
      date = new Date(isoString);
    }

    if (isNaN(date.getTime())) {
      return 'ไม่ทราบเวลา';
    }

    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setSnackbar({
      open: true,
      message: 'ออกจากระบบสำเร็จ',
      severity: 'info'
    });
  };

  const groupOrdersByDate = (orders) => {
    const groups = {};
    orders.forEach(order => {
      const date = new Date(order.orderTime.replace(' ', 'T'));
      const dateKey = date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(order);
    });
    return groups;
  };

  const handleClearOldOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }

      const response = await fetch('http://localhost:5000/api/orders/clear-old', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'เคลียร์ออเดอร์ของวันก่อนหน้าสำเร็จ',
          severity: 'success'
        });
        fetchOrders();
      } else {
        throw new Error('Failed to clear old orders');
      }
    } catch (error) {
      console.error('Error clearing old orders:', error);
      setSnackbar({
        open: true,
        message: 'ไม่สามารถเคลียร์ออเดอร์ของวันก่อนหน้าได้',
        severity: 'error'
      });
    }
    setClearConfirmOpen(false);
  };

  const filteredOrders = orders.filter(order => {
    if (currentTab === 0) return true;
    if (currentTab === 1) return order.status === 'รอดำเนินการ';
    if (currentTab === 2) return order.status === 'กำลังทำ';
    if (currentTab === 3) return order.status === 'เสร็จสิ้น';
    if (currentTab === 4) return order.status === 'ยกเลิก';
    return false;
  }).sort((a, b) => {
    const dateA = new Date(a.orderTime.replace(' ', 'T'));
    const dateB = new Date(b.orderTime.replace(' ', 'T'));
    return dateB - dateA;
  });

  const groupedOrders = groupOrdersByDate(filteredOrders);

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        paddingTop: { xs: '56px', sm: '64px' },
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 3, sm: 4, md: 6 },
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 1,
          overflowX: 'hidden'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mr: 2 }}>
              จัดการคำสั่งซื้อ
            </Typography>
            <Button
              variant="contained"
              startIcon={<MenuBookIcon />}
              onClick={() => navigate('/menu')}
              sx={{
                ml: 1,
                background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.7) 30%, rgba(139, 195, 74, 0.7) 90%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(56, 142, 60, 0.8) 30%, rgba(104, 159, 56, 0.8) 90%)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              ไปที่เมนู
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/order-history')}
              sx={{
                background: '#1a1a1a',
                '&:hover': {
                  background: '#333333',
                },
                color: 'white',
              }}
            >
              ดูประวัติออเดอร์
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => setClearConfirmOpen(true)}
              sx={{
                background: 'linear-gradient(45deg, rgba(255, 152, 0, 0.7) 30%, rgba(255, 193, 7, 0.7) 90%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(230, 81, 0, 0.8) 30%, rgba(255, 171, 0, 0.8) 90%)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              เคลียร์ออเดอร์เก่า
            </Button>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                background: 'linear-gradient(45deg, rgba(244, 67, 54, 0.7) 30%, rgba(255, 87, 34, 0.7) 90%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(211, 47, 47, 0.8) 30%, rgba(230, 74, 25, 0.8) 90%)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              ออกจากระบบ
            </Button>
          </Box>
        </Box>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: { xs: 2, sm: 3, md: 4 },
            '& .MuiTabs-indicator': { backgroundColor: 'white' },
            '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
            '& .Mui-selected': { color: 'white !important' },
          }}
        >
          <Tab label="ทั้งหมด" />
          <Tab label="รอดำเนินการ" />
          <Tab label="กำลังทำ" />
          <Tab label="เสร็จสิ้น" />
          <Tab label="ยกเลิก" />
        </Tabs>

        {Object.keys(groupedOrders).length === 0 ? (
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', mt: 4 }}>
            ไม่มีคำสั่งซื้อในสถานะนี้
          </Typography>
        ) : (
          Object.entries(groupedOrders).map(([date, orders]) => (
            <Box key={date} sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AccessTimeIcon />
                {date}
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {orders.map((order) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                    <Card
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease-in-out',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                            #{order.id}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getStatusIcon(order.status)}
                            <Chip
                              label={order.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(order.status),
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />
                          </Box>
                        </Box>
                        <Divider sx={{ mb: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: '1rem' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                            {order.customerName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: '1rem' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {formatTime(order.orderTime)}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1, mb: 0.5 }}>
                            รายการ ({Array.isArray(order.items) ? order.items.length : 0} รายการ):
                          </Typography>
                          <List dense disablePadding>
                            {(Array.isArray(order.items) ? order.items : []).slice(0, 2).map((item, index) => (
                              <ListItem key={index} sx={{ py: 0.5, px: 0, display: 'block' }}>
                                <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Typography component="div" variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {item.name} (x{item.quantity})
                                  </Typography>
                                </Box>
                                <Typography component="div" variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                                  ฿{(parseFloat(item.price || 0) * parseFloat(item.quantity || 0)).toFixed(2)}
                                </Typography>
                              </ListItem>
                            ))}
                            {(Array.isArray(order.items) ? order.items.length : 0) > 2 && (
                              <ListItem sx={{ py: 0.2, px: 0 }}>
                                <Typography component="div" variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                  และอื่นๆอีก {(Array.isArray(order.items) ? order.items.length : 0) - 2} รายการ
                                </Typography>
                              </ListItem>
                            )}
                          </List>
                        </Box>
                        <Typography variant="h6" component="p" sx={{ color: 'white', fontWeight: 600, textAlign: 'right', mt: 2 }}>
                          รวม: ฿{(parseFloat(order.total) || 0).toFixed(2)}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', p: { xs: 1, sm: 2 }, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {order.status === 'รอดำเนินการ' && (
                          <Button
                            variant="contained"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => handleStatusChange(order.id, 'กำลังทำ')}
                            sx={{
                              backgroundColor: '#2196F3',
                              '&:hover': {
                                backgroundColor: '#1976D2',
                              },
                              color: 'white',
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                              padding: isMobile ? '4px 8px' : '6px 12px',
                            }}
                          >
                            เริ่มทำ
                          </Button>
                        )}
                        {order.status === 'กำลังทำ' && (
                          <Button
                            variant="contained"
                            startIcon={<DoneIcon />}
                            onClick={() => handleStatusChange(order.id, 'เสร็จสิ้น')}
                            sx={{
                              backgroundColor: '#4CAF50',
                              '&:hover': {
                                backgroundColor: '#388E3C',
                              },
                              color: 'white',
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                              padding: isMobile ? '4px 8px' : '6px 12px',
                            }}
                          >
                            ทำเสร็จ
                          </Button>
                        )}
                        {(order.status === 'รอดำเนินการ' || order.status === 'กำลังทำ') && (
                          <Button
                            variant="contained"
                            startIcon={<CancelIcon />}
                            onClick={() => handleStatusChange(order.id, 'ยกเลิก')}
                            sx={{
                              backgroundColor: '#F44336',
                              '&:hover': {
                                backgroundColor: '#D32F2F',
                              },
                              color: 'white',
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                              padding: isMobile ? '4px 8px' : '6px 12px',
                            }}
                          >
                            ยกเลิก
                          </Button>
                        )}
                        <Tooltip title="ดูรายละเอียด" arrow>
                          <IconButton
                            aria-label="view details"
                            onClick={() => handleViewDetails(order)}
                            sx={{
                              color: '#90CAF9',
                              '&:hover': {
                                backgroundColor: 'rgba(144, 202, 249, 0.1)',
                              }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Container>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={handleCloseDetails}
        aria-labelledby="order-details-title"
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiPaper-root': { background: '#1e1e1e', color: 'white' } }}
      >
        <DialogTitle id="order-details-title" sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
          รายละเอียดคำสั่งซื้อ #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {selectedOrder && (
            <Box>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                **ชื่อลูกค้า:** {selectedOrder.customerName}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                <AccessTimeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                **เวลาสั่ง:** {(function() {
                  let date = new Date(selectedOrder.orderTime.replace(' ', 'T'));
                  if (isNaN(date.getTime()) && typeof selectedOrder.orderTime === 'string') {
                    const isoString = selectedOrder.orderTime.replace(' ', 'T');
                    date = new Date(isoString);
                  }
                  return isNaN(date.getTime()) ? 'ไม่ทราบเวลา' : date.toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                })()}
              </Typography>
              <Box sx={{ mb: 2, mt: 1 }}>
                <Chip
                  label={selectedOrder.status}
                  size="small"
                  sx={{
                    backgroundColor: getStatusColor(selectedOrder.status),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <Typography variant="h6" sx={{ color: 'white', mb: 1.5 }}>
                รายการสินค้า:
              </Typography>
              <List dense disablePadding>
                {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0, display: 'block' }}>
                    <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography component="div" variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {item.name} (x{item.quantity})
                      </Typography>
                      <Typography component="div" variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                        ฿{(parseFloat(item.price || 0) * parseFloat(item.quantity || 0)).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box component="div" sx={{ ml: 2, mt: 0.5 }}>
                      {item.sweetness && (
                        <Typography component="div" variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          - ความหวาน: {item.sweetness}
                        </Typography>
                      )}
                      {item.temperature && (
                        <Typography component="div" variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          - อุณหภูมิ: {item.temperature}
                        </Typography>
                      )}
                      {item.notes && (
                        <Typography component="div" variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          - หมายเหตุ: {item.notes}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'right' }}>
                ยอดรวมทั้งหมด: ฿{(parseFloat(selectedOrder.total) || 0).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
          <Button onClick={handleCloseDetails} sx={{ color: '#90CAF9' }}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Clear Orders Confirmation Dialog */}
      <Dialog
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(45,45,45,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            color: 'white',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 'bold' }}>
          ยืนยันการเคลียร์ออเดอร์
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            คุณต้องการเคลียร์ออเดอร์ของวันก่อนหน้าหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearConfirmOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleClearOldOrders}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
              color: '#1a1a1a',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #FFA000 30%, #FFD700 90%)',
              }
            }}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Staff; 