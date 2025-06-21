import React, { useState, useEffect, useRef } from 'react';
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
  CardActions,
  Select,
  MenuItem,
  AppBar,
  Toolbar
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
  History as HistoryIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';
import Navbar from '../components/Navbar';
import { api } from '../api'; // Use named import

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?from=/staff');
      return;
    }
    fetchOrders();

    // Connect to WebSocket server
    socketRef.current = io(API_BASE_URL); // Use centralized API_URL

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socketRef.current.on('newOrder', (newOrder) => {
      console.log('New order received:', newOrder);
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    socketRef.current.on('updateOrder', (updatedOrder) => {
      console.log('Order updated:', updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    });

    socketRef.current.on('deleteOrder', (deletedOrderId) => {
      console.log('Order deleted:', deletedOrderId);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== deletedOrderId)
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isLoggedIn, navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }
      // Use the centralized api instance
      const response = await api.get('/api/orders'); 
      const data = response.data; // with axios, data is on response.data
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Invalid data format:', data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response && error.response.status === 401) {
        logout();
      }
      setOrders([]);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }
      // Use the centralized api instance
      await api.put(`/api/orders/${orderId}`, { status: newStatus }); 
      // UI will be updated by the socket event, no need to show snackbar here
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.response && error.response.status === 401) {
        logout();
      }
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
      case 'pending':
        return '#ff9800';
      case 'preparing':
        return '#2196f3';
      case 'completed':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <TimerIcon />;
      case 'preparing':
        return <CoffeeIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <ErrorIcon />;
      default:
        return <AccessTimeIcon />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'รอดำเนินการ';
      case 'preparing':
        return 'กำลังทำ';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
  };

  function isToday(dateString) {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  const filteredOrders = orders
    .filter(order => isToday(order.created_at || order.orderTime))
    .filter(order => {
      const status = (order.status || '').toLowerCase();
      if (currentTab === 0) return status === 'pending' || status === 'รอดำเนินการ';
      if (currentTab === 1) return status === 'preparing' || status === 'กำลังทำ';
      if (currentTab === 2) return status === 'completed' || status === 'เสร็จสิ้น';
      if (currentTab === 3) return status === 'cancelled' || status === 'ยกเลิก';
      return false;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <>
      <Navbar />
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          pt: '15vh',
          pb: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
          position: 'relative',
          overflowX: 'hidden',
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
          maxWidth={false} 
          sx={{ 
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              mb: { xs: 2, sm: 3, md: 4 },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
                mb: { xs: 1, sm: 2 }
              }}
            >
              จัดการคำสั่งซื้อ
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: { xs: 1, sm: 2 },
              justifyContent: { xs: 'center', sm: 'space-between' }
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                จำนวนคำสั่งซื้อวันนี้: {orders.filter(order => isToday(order.created_at || order.orderTime)).length}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '999px',
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1.2, sm: 1.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    boxShadow: '0 2px 8px rgba(244,67,54,0.10)',
                    background: 'linear-gradient(90deg, #ff5252 0%, #f44336 100%)',
                    color: '#fff',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #f44336 0%, #ff5252 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 16px rgba(244,67,54,0.18)'
                    }
                  }}
                >
                  ออกจากระบบ
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Paper
            sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflowX: 'auto',
              mb: { xs: 2, sm: 3, md: 4 },
              width: '100%'
            }}
          >
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: '80px', sm: 'auto' },
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 'bold'
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                },
              }}
            >
              <Tab label="รอดำเนินการ" />
              <Tab label="กำลังทำ" />
              <Tab label="เสร็จสิ้น" />
              <Tab label="ยกเลิก" />
            </Tabs>
          </Paper>

          {/* Orders Grid */}
          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 4 }}
            columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            sx={{
              justifyContent: 'center'
            }}
          >
            {filteredOrders.map((order) => (
              <Grid 
                item 
                xs={1}
                key={order.id}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: `2.5px solid ${getStatusColor(order.status)}`,
                    boxShadow: `0 0 16px 2px ${getStatusColor(order.status)}33`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 12px 24px ${getStatusColor(order.status)}55`,
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: { xs: '280px', sm: '320px' }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          lineHeight: 1.2
                        }}
                      >
                        #{order.id}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={getStatusText(order.status)}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: '24px', sm: '28px' }
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        mb: 1
                      }}
                    >
                      {order.customer_name || order.customerName || '-'}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                        mb: 1
                      }}
                    >
                      {formatTime(order.created_at)}
                    </Typography>
                    
                    <Box sx={{ mb: 1 }}>
                      {order.items && order.items.map((item, index) => {
                        const options = item.selectedOptions || item.selected_options;
                        return (
                          <Paper
                            key={index}
                            elevation={0}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.08)',
                              borderRadius: 2,
                              p: 1,
                              mb: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CoffeeIcon fontSize="small" sx={{ color: '#FFD700' }} />
                              <Typography sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>
                                {item.name}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                                x{item.quantity}
                              </Typography>
                            </Box>
                            {/* ตัวเลือกเพิ่มเติม */}
                            {options && Object.keys(options).length > 0 && (
                              <Box sx={{ ml: 3, mt: 0.5 }}>
                                <Typography sx={{ color: '#90caf9', fontSize: '0.9rem', fontWeight: 500 }}>
                                  ตัวเลือกเพิ่มเติม:
                                </Typography>
                                {Object.entries(options).map(([key, option], idx) => {
                                  let detail = option.option_name || option.name || option;
                                  if ((option.price_adjustment && option.price_adjustment !== '0.00') || (option.price && option.price !== '0.00')) {
                                    const price = option.price_adjustment || option.price;
                                    detail += ` (+${parseFloat(price).toFixed(2)} บาท)`;
                                  }
                                  if (option.detail) {
                                    detail += ` (${option.detail})`;
                                  }
                                  return (
                                    <Typography key={idx} sx={{ color: '#90caf9', fontSize: '0.9rem', ml: 2 }}>
                                      - {key}: {detail}
                                    </Typography>
                                  );
                                })}
                              </Box>
                            )}
                            {/* หมายเหตุ */}
                            {item.note && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3 }}>
                                <ErrorIcon fontSize="small" sx={{ color: '#ff7043' }} />
                                <Typography sx={{ color: '#ff7043', fontSize: '0.9rem' }}>
                                  หมายเหตุ: {item.note}
                                </Typography>
                              </Box>
                            )}
                            {/* ราคาพื้นฐานของเมนู */}
                            {item.price && (
                              <Typography sx={{ color: '#FFD700', fontSize: '0.95rem', fontWeight: 500, ml: 3 }}>
                                ราคาเริ่มต้น: {parseFloat(item.price).toFixed(2)} บาท
                              </Typography>
                            )}
                          </Paper>
                        );
                      })}
                    </Box>
                    
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#FFD700',
                        fontWeight: 'bold',
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        mt: 1,
                        mb: 1
                      }}
                    >
                      {`รวม: ฿${order.total_amount || order.total || order.totalAmount || (order.items ? order.items.reduce((sum, item) => sum + parseFloat(item.total_price || (item.price * item.quantity)), 0) : 0).toFixed(2)}`}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ 
                    justifyContent: 'center', 
                    p: { xs: 1, sm: 1.5 },
                    gap: 1
                  }}>
                    <Tooltip title="ดูรายละเอียด">
                      <IconButton
                        onClick={() => handleViewDetails(order)}
                        sx={{
                          color: 'white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          minWidth: { xs: '36px', sm: '40px' },
                          minHeight: { xs: '36px', sm: '40px' },
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      >
                        <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </Tooltip>
                    
                    {(order.status === 'pending' || order.status === 'รอดำเนินการ') && (
                      <>
                        <Tooltip title="เริ่มทำ">
                          <IconButton
                            onClick={() => handleStatusChange(order.id, 'preparing')}
                            sx={{
                              color: 'white',
                              background: '#4CAF50',
                              minWidth: { xs: '36px', sm: '40px' },
                              minHeight: { xs: '36px', sm: '40px' },
                              '&:hover': {
                                background: '#388E3C',
                              }
                            }}
                          >
                            <PlayArrowIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ยกเลิก">
                          <IconButton
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                            sx={{
                              color: 'white',
                              background: '#f44336',
                              minWidth: { xs: '36px', sm: '40px' },
                              minHeight: { xs: '36px', sm: '40px' },
                              '&:hover': {
                                background: '#d32f2f',
                              }
                            }}
                          >
                            <CancelIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    
                    {(order.status === 'preparing' || order.status === 'กำลังทำ') && (
                      <Tooltip title="เสร็จสิ้น">
                        <IconButton
                          onClick={() => handleStatusChange(order.id, 'completed')}
                          sx={{
                            color: 'white',
                            background: '#4CAF50',
                            minWidth: { xs: '36px', sm: '40px' },
                            minHeight: { xs: '36px', sm: '40px' },
                            '&:hover': {
                              background: '#388E3C',
                            }
                          }}
                        >
                          <CheckCircleIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredOrders.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: { xs: 4, sm: 6, md: 8 },
              color: 'rgba(255,255,255,0.7)'
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                ไม่มีคำสั่งซื้อในสถานะนี้
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                คำสั่งซื้อใหม่จะปรากฏที่นี่
              </Typography>
            </Box>
          )}

          {/* Order Details Dialog */}
          <Dialog
            open={orderDetailsOpen}
            onClose={handleCloseDetails}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: { xs: '95%', sm: '80%', md: '70%' }
              }
            }}
          >
            {selectedOrder && (
              <>
                <DialogTitle sx={{ color: 'white', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                  รายละเอียดคำสั่งซื้อ #{selectedOrder.id}
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                      ข้อมูลลูกค้า
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      ชื่อ: {selectedOrder.customer_name || selectedOrder.customerName || '-'}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      เวลา: {formatTime(selectedOrder.created_at)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                      รายการสินค้า
                    </Typography>
                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                        <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                          {item.name} x{item.quantity}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                          ฿{item.price} ต่อชิ้น
                        </Typography>
                        {(() => {
                          const options = item.selectedOptions || item.selected_options;
                          return options && Object.keys(options).length > 0 && (
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                              ตัวเลือก: {Object.entries(options).map(([key, option]) => {
                                let detail = option.option_name || option.name || option;
                                if ((option.price_adjustment && option.price_adjustment !== '0.00') || (option.price && option.price !== '0.00')) {
                                  const price = option.price_adjustment || option.price;
                                  detail += ` (+${price})`;
                                }
                                if (option.detail) {
                                  detail += ` (${option.detail})`;
                                }
                                return `${key}: ${detail}`;
                              }).join(', ')}
                            </Typography>
                          );
                        })()}
                        {item.sweetness && (
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                            ความหวาน: {item.sweetness}
                          </Typography>
                        )}
                        {item.temperature && (
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                            อุณหภูมิ: {item.temperature}
                          </Typography>
                        )}
                        {item.note && (
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                            หมายเหตุ: {item.note}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                  
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      รวมทั้งหมด:
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                      ฿{
                        selectedOrder.total_amount ||
                        selectedOrder.total ||
                        (selectedOrder.items ? selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0)
                      }
                    </Typography>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                  <Button 
                    onClick={handleCloseDetails}
                    sx={{
                      color: 'white',
                      background: 'rgba(255, 255, 255, 0.1)',
                      minWidth: { xs: '80px', sm: '100px' },
                      minHeight: { xs: '40px', sm: '36px' },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    ปิด
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

export default Staff; 