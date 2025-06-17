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
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/history', {
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
        width: '100vw',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        position: 'relative',
        overflowX: 'hidden',
        py: 0,
        pt: 4,
        px: { xs: 2, sm: 3, md: 4 },
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
          width: '100%',
          pt: { xs: 8, sm: 9, md: 10 }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            width: '100%'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' }
              }}
            >
              ประวัติออเดอร์
            </Typography>
          </Box>
        </Box>

        <Paper 
          sx={{ 
            p: 2, 
            mb: 4,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="ค้นหาตามชื่อลูกค้าหรือวันที่..."
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
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={thLocale}>
                <DatePicker
                  label="วันที่เริ่มต้น"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      sx: {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        '&.Mui-focused fieldset': { borderColor: 'white' },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiInputBase-input': { color: 'white' },
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={thLocale}>
                <DatePicker
                  label="วันที่สิ้นสุด"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      sx: {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        '&.Mui-focused fieldset': { borderColor: 'white' },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiInputBase-input': { color: 'white' },
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mb: 4 }}>
          {Object.entries(groupedOrders).map(([date, dateOrders]) => (
            <Accordion
              key={date}
              sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px !important',
                mb: 2,
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  borderRadius: '16px',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.05)'
                  }
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }
                }}
              >
                <CalendarIcon sx={{ color: 'white' }} />
                <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                  {date} ({dateOrders.length} รายการ)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>เวลา</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>ชื่อลูกค้า</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>สถานะ</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>ยอดรวม</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>รายละเอียด</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dateOrders.map((order) => (
                        <TableRow 
                          key={order.id}
                          sx={{
                            '&:hover': {
                              background: 'rgba(255,255,255,0.05)'
                            }
                          }}
                        >
                          <TableCell sx={{ color: 'white' }}>
                            {new Date(order.orderTime).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell sx={{ color: 'white' }}>{order.customerName}</TableCell>
                          <TableCell>
                            <Chip 
                              label={order.status}
                              color={
                                order.status === 'เสร็จสิ้น' ? 'success' :
                                order.status === 'รอดำเนินการ' ? 'warning' :
                                'error'
                              }
                              sx={{
                                fontWeight: 'bold',
                                minWidth: '100px'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{order.total} บาท</TableCell>
                          <TableCell>
                            <IconButton 
                              onClick={() => handleViewOrder(order)}
                              sx={{ 
                                color: 'white',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.1)'
                                }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(45,45,45,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px'
            }
          }}
        >
          {selectedOrder && (
            <>
              <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                รายละเอียดออเดอร์
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                        วันที่: {formatDate(selectedOrder.orderTime)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                        ชื่อลูกค้า: {selectedOrder.customerName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                        สถานะ: {selectedOrder.status}
                      </Typography>
                    </Grid>
                  </Grid>

                  <TableContainer 
                    component={Paper} 
                    sx={{ 
                      mb: 2, 
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px'
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>รายการ</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ราคา</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>จำนวน</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ความหวาน</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>อุณหภูมิ</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>หมายเหตุ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow 
                            key={index}
                            sx={{
                              '&:hover': {
                                background: 'rgba(255,255,255,0.05)'
                              }
                            }}
                          >
                            <TableCell sx={{ color: 'white' }}>{item.name}</TableCell>
                            <TableCell sx={{ color: 'white' }}>{item.price} บาท</TableCell>
                            <TableCell sx={{ color: 'white' }}>{item.quantity}</TableCell>
                            <TableCell sx={{ color: 'white' }}>{item.sweetness}</TableCell>
                            <TableCell sx={{ color: 'white' }}>{item.temperature}</TableCell>
                            <TableCell sx={{ color: 'white' }}>{item.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'white', 
                      textAlign: 'right',
                      fontWeight: 'bold',
                      fontSize: '1.25rem'
                    }}
                  >
                    ยอดรวม: {selectedOrder.total} บาท
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
                <Button 
                  onClick={handleCloseDialog} 
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)'
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