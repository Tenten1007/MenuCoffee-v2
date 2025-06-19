import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Visibility as VisibilityIcon, 
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import thLocale from 'date-fns/locale/th';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  const formatDateOnly = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  const groupOrdersByDate = (orders) => {
    const groups = {};
    orders.forEach(order => {
      const date = formatDateOnly(order.orderTime);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
    });
    return groups;
  };

  const filterOrders = (orders) => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderTime);
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatDate(order.orderTime).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDateRange = 
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate);

      return matchesSearch && matchesDateRange;
    });
  };

  const filteredOrders = filterOrders(orders);
  const groupedOrders = groupOrdersByDate(filteredOrders);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        position: 'relative',
        overflowX: 'hidden',
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
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
        disableGutters
        sx={{ 
          position: 'relative',
          zIndex: 1,
          flexGrow: 1,
          width: '100%'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: { xs: 2, sm: 3, md: 4 },
            gap: { xs: 2, sm: 0 },
            width: '100%'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <IconButton 
              onClick={() => navigate('/staff')}
              sx={{ 
                color: 'white',
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.25rem' }
              }}
            >
              ประวัติออเดอร์
            </Typography>
          </Box>
        </Box>

        <Paper 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: { xs: 2, sm: 3, md: 4 },
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="ค้นหาลูกค้าหรือวันที่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={thLocale}>
                <DatePicker
                  label="วันที่เริ่มต้น"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: 'white' },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={thLocale}>
                <DatePicker
                  label="วันที่สิ้นสุด"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: 'white' },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          {Object.entries(groupedOrders).map(([date, dateOrders]) => (
            <Accordion
              key={date}
              sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 2,
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  margin: '16px 0'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                <CalendarIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                  {date} ({dateOrders.length} ออเดอร์)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  {dateOrders.map((order) => (
                    <Grid item xs={12} sm={6} md={4} key={order.id}>
                      <Paper
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                          >
                            #{order.id}
                          </Typography>
                          <Chip
                            label={order.status}
                            size="small"
                            sx={{
                              backgroundColor: 
                                order.status === 'completed' || order.status === 'เสร็จสิ้น' ? '#4caf50' :
                                order.status === 'cancelled' || order.status === 'ยกเลิก' ? '#f44336' :
                                order.status === 'preparing' || order.status === 'กำลังทำ' ? '#2196f3' :
                                '#ff9800', // pending, รอดำเนินการ
                              color: 'white',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: '20px', sm: '24px' }
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
                          {order.customerName || order.customer_name || '-'}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                            mb: 1
                          }}
                        >
                          {formatDate(order.orderTime)}
                        </Typography>
                        
                        <Box sx={{ mb: 1 }}>
                          {order.items.slice(0, 2).map((item, index) => (
                            <Typography 
                              key={index} 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                lineHeight: 1.3
                              }}
                            >
                              • {item.name} x{item.quantity}
                            </Typography>
                          ))}
                          {order.items.length > 2 && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                              }}
                            >
                              และอีก {order.items.length - 2} รายการ
                            </Typography>
                          )}
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mt: 1
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#FFD700', 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                          >
                            ฿{order.total}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleViewOrder(order)}
                            sx={{
                              color: 'white',
                              background: 'rgba(255, 255, 255, 0.1)',
                              minWidth: { xs: '32px', sm: '36px' },
                              minHeight: { xs: '32px', sm: '36px' },
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.2)',
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {Object.keys(groupedOrders).length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 4, sm: 6, md: 8 },
            color: 'rgba(255,255,255,0.7)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              ไม่พบประวัติออเดอร์
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              ลองเปลี่ยนเงื่อนไขการค้นหาหรือช่วงวันที่
            </Typography>
          </Box>
        )}

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
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
                รายละเอียดออเดอร์ #{selectedOrder.id}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    ข้อมูลลูกค้า
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    ชื่อ: {selectedOrder.customerName || selectedOrder.customer_name || '-'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    เวลา: {formatDate(selectedOrder.orderTime)}
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    รายการสินค้า
                  </Typography>
                  {selectedOrder.items.map((item, index) => (
                    <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                      <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                        {item.name} x{item.quantity}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                        ฿{item.price} ต่อชิ้น
                      </Typography>
                      {((item.selectedOptions && Object.keys(item.selectedOptions).length > 0) || (item.selected_options && Object.keys(item.selected_options).length > 0)) && (
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', mt: 0.5 }}>
                          ตัวเลือก: {
                            item.selectedOptions
                              ? Object.values(item.selectedOptions).map(opt => opt.option_name || opt.name).join(', ')
                              : item.selected_options
                                ? Object.values(item.selected_options).map(opt => opt.option_name || opt.name).join(', ')
                                : '-'
                          }
                        </Typography>
                      )}
                      {item.note && (
                        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mt: 0.5 }}>
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
                    ฿{selectedOrder.total}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                <Button 
                  onClick={handleCloseDialog}
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
      </Container>
    </Box>
  );
};

export default OrderHistory; 