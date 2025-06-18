import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Snackbar,
  Alert,
  Fab,
  Tooltip,
  Zoom,
  DialogContentText,
  Tabs,
  Tab,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();
  const [coffees, setCoffees] = useState([]);
  const [filteredCoffees, setFilteredCoffees] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [staffLoginOpen, setStaffLoginOpen] = useState(false);
  const [staffCredentials, setStaffCredentials] = useState({ username: '', password: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuOptions, setMenuOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLoggedIn, login } = useAuth();

  useEffect(() => {
    fetchCoffees();
  }, []);

  useEffect(() => {
    filterCoffees();
  }, [coffees, searchQuery, selectedCategory]);

  const fetchCoffees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/coffees');
      setCoffees(response.data);
    } catch (error) {
      console.error('Error fetching coffees:', error);
      setSnackbar({
        open: true,
        message: 'ไม่สามารถโหลดรายการกาแฟได้',
        severity: 'error'
      });
    }
  };

  const filterCoffees = () => {
    let filtered = [...coffees];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(coffee => coffee.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(coffee => 
        coffee.name.toLowerCase().includes(query) ||
        coffee.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredCoffees(filtered);
  };

  const handleAddToCart = async (coffee) => {
    try {
      // ดึงข้อมูลตัวเลือกทั้งหมด
      const response = await axios.get(`http://localhost:5000/api/coffees/${coffee.id}/options`);
      const options = response.data;

      // จัดกลุ่มตัวเลือกตามประเภท
      const groupedOptions = options.reduce((acc, option) => {
        if (!acc[option.option_type]) {
          acc[option.option_type] = [];
        }
        acc[option.option_type].push(option);
        return acc;
      }, {});

      // ตั้งค่าเริ่มต้นให้ว่างเปล่า
      const initialSelectedOptions = {};
      
      setMenuOptions(groupedOptions);
      setSelectedOptions(initialSelectedOptions);
      setSelectedCoffee(coffee);
      setOptionDialogOpen(true);
    } catch (error) {
      console.error('Error fetching menu options:', error);
      alert('ไม่สามารถดึงข้อมูลตัวเลือกได้');
    }
  };

  const handleOptionChange = (type, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [type]: option
    }));
  };

  const calculateTotalPrice = () => {
    if (!selectedCoffee) return 0;
    
    const basePrice = parseFloat(selectedCoffee.price);
    const optionsPrice = Object.values(selectedOptions).reduce((total, option) => {
      return total + (parseFloat(option.price_adjustment) || 0);
    }, 0);
    
    return basePrice + optionsPrice;
  };

  const handleConfirmAddToCart = () => {
    // ตรวจสอบว่าผู้ใช้ได้เลือกตัวเลือกครบทุกประเภทหรือไม่
    const allTypesSelected = Object.keys(menuOptions).every(type => selectedOptions[type]);
    
    if (!allTypesSelected) {
      alert('กรุณาเลือกตัวเลือกให้ครบทุกประเภท');
      return;
    }

    // เพิ่มลงตะกร้า
    const cartItem = {
      id: selectedCoffee.id,
      name: selectedCoffee.name,
      price: selectedCoffee.price,
      quantity: 1,
      totalPrice: calculateTotalPrice(),
      selectedOptions: selectedOptions
    };

    setCart(prev => [...prev, cartItem]);
    setOptionDialogOpen(false);
    setSelectedCoffee(null);
    setSelectedOptions({});
    setSnackbar({
      open: true,
      message: 'เพิ่มลงตะกร้าเรียบร้อยแล้ว',
      severity: 'success'
    });
  };

  const handleRemoveFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    setSnackbar({
      open: true,
      message: 'ลบรายการออกจากตะกร้าแล้ว',
      severity: 'info'
    });
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      setSnackbar({
        open: true,
        message: 'กรุณากรอกชื่อลูกค้า',
        severity: 'error'
      });
      return;
    }

    try {
      const orderData = {
        customerName: customerName.trim(),
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          selectedOptions: item.selectedOptions,
          note: item.note
        })),
        status: 'รอดำเนินการ'
      };

      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      
      if (response.status === 201) {
        setCart([]);
        setCustomerName('');
        setCartOpen(false);
        setSnackbar({
          open: true,
          message: 'สั่งซื้อสำเร็จ! รอรับออเดอร์ของคุณได้เลย',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ',
        severity: 'error'
      });
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + ((item.totalPrice || item.price) * item.quantity), 0);
  };

  const handleStaffLogin = async () => {
    if (isLoggedIn) {
      navigate('/staff');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/staff/login', {
        username: staffCredentials.username,
        password: staffCredentials.password
      });
      
      if (response.data.token) {
        login(response.data.token);
        setStaffLoginOpen(false);
        setStaffCredentials({ username: '', password: '' });
        navigate('/staff');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setSnackbar({
        open: true,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        severity: 'error'
      });
    }
  };

  const categories = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'recommended', label: 'เมนูแนะนำ' },
    { value: 'coffee', label: 'กาแฟ' },
    { value: 'matcha', label: 'มัทฉะ' },
    { value: 'tea', label: 'ชา' },
    { value: 'milk', label: 'นม' },
    { value: 'italian-soda', label: 'อิตาเลี่ยนโซดา' },
    { value: 'snack', label: 'ขนม' },
    { value: 'bakery', label: 'เบเกอรี่' },
    { value: 'leaf-tea', label: 'ใบชา' },
    { value: 'food', label: 'อาหาร' }
  ];

  return (
    <>
      <Navbar />
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
            width: '100%'
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
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' }
              }}
            >
              Coffee Menu
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="ค้นหาเมนู"
                variant="outlined"
                size="small"
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
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={isLoggedIn ? () => navigate('/staff') : () => setStaffLoginOpen(true)}
                  sx={{
                    background: isLoggedIn ? '#4caf50' : '#1a1a1a',
                    '&:hover': {
                      background: isLoggedIn ? '#388e3c' : '#333333',
                    },
                    color: 'white',
                    transition: 'background-color 0.3s ease',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  {isLoggedIn ? 'Staff Dashboard' : 'Staff Login'}
                </Button>
              </Grid>
            </Box>
          </Box>

          <Paper
            sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflowX: 'auto',
              mb: 4,
              width: '100%'
            }}
          >
            <Tabs
              value={selectedCategory}
              onChange={(e, newValue) => setSelectedCategory(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
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
              {categories.map((category) => (
                <Tab key={category.value} value={category.value} label={category.label} />
              ))}
            </Tabs>
          </Paper>

          <Grid 
            container 
            spacing={4}
            columns={{ xs: 4, sm: 8, md: 12 }}
            sx={{
              justifyContent: 'center',
              width: '100%'
            }}
          >
            {filteredCoffees.map((coffee) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={coffee.id}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={coffee.image}
                    alt={coffee.name}
                    sx={{
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="div" 
                      sx={{ color: 'white', fontWeight: 'bold' }}
                    >
                      {coffee.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {coffee.description}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2, color: '#FFD700', fontWeight: 'bold' }}>
                      ฿{coffee.price}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />} 
                      onClick={() => handleAddToCart(coffee)}
                      sx={{
                        background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
                        color: '#1a1a1a',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FFA000 30%, #FFD700 90%)',
                        }
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Drawer
          anchor="right"
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          PaperProps={{
            sx: {
              width: isMobile ? '100%' : 400,
              background: 'rgba(45,45,45,0.95)',
              backdropFilter: 'blur(10px)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
              ตะกร้าสินค้า
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
            {cart.length === 0 ? (
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                ตะกร้าว่างเปล่า
              </Typography>
            ) : (
              <List>
                {cart.map((item, index) => (
                  <ListItem key={index} sx={{ py: 1, px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: 'white' }}>
                          {item.name} x {item.quantity}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          {Object.entries(item.selectedOptions || {}).map(([type, option]) => (
                            <Typography key={type} variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                              {type === 'temperature' ? 'อุณหภูมิ' :
                               type === 'sweetness' ? 'ความหวาน' :
                               type === 'toppings' ? 'ท็อปปิ้ง' :
                               type === 'size' ? 'ขนาด' : type}: {option.option_name}
                              {option.price_adjustment > 0 && ` (+${option.price_adjustment}฿)`}
                            </Typography>
                          ))}
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            ฿{(item.totalPrice || item.price) * item.quantity}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleRemoveFromCart(index)}
                        sx={{ color: '#ef5350' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    รวมทั้งหมด:
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                    ฿{calculateTotal()}
                  </Typography>
                </Box>
                <TextField
                  label="ชื่อลูกค้า"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSubmitOrder}
                  startIcon={<CartIcon />}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
                    color: '#1a1a1a',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FFA000 30%, #FFD700 90%)',
                    }
                  }}
                >
                  ยืนยันการสั่งซื้อ
                </Button>
              </List>
            )}
          </Box>
        </Drawer>

        <Dialog
          open={orderDialogOpen}
          onClose={() => setOrderDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>เพิ่มลงตะกร้า</DialogTitle>
          <DialogContent>
            {selectedCoffee && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedCoffee.name}
                </Typography>
                
                {/* ตัวเลือกเมนู */}
                {Object.entries(selectedCoffee.options || {}).map(([type, options]) => (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {type === 'temperature' ? 'อุณหภูมิ' :
                       type === 'sweetness' ? 'ความหวาน' :
                       type === 'toppings' ? 'ท็อปปิ้ง' :
                       type === 'size' ? 'ขนาด' : type}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {options.map((option) => (
                        <Button
                          key={option.id}
                          variant={selectedOptions[type]?.id === option.id ? "contained" : "outlined"}
                          onClick={() => handleOptionChange(type, option)}
                          disabled={!option.is_available}
                          sx={{ mb: 1 }}
                        >
                          {option.option_name}
                          {option.price_adjustment > 0 && ` (+${option.price_adjustment}฿)`}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                ))}

                {/* ปริมาณ */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mr: 2 }}>
                    จำนวน:
                  </Typography>
                  <IconButton
                    onClick={() => setSelectedCoffee(prev => ({
                      ...prev,
                      quantity: Math.max(1, prev.quantity - 1)
                    }))}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ mx: 2 }}>
                    {selectedCoffee.quantity}
                  </Typography>
                  <IconButton
                    onClick={() => setSelectedCoffee(prev => ({
                      ...prev,
                      quantity: prev.quantity + 1
                    }))}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                {/* ราคารวม */}
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="h6">
                    ราคารวม: ฿{calculateTotalPrice()}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleConfirmAddToCart} variant="contained">
              เพิ่มลงตะกร้า
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={staffLoginOpen}
          onClose={() => setStaffLoginOpen(false)}
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
          <DialogTitle sx={{ color: 'white', fontWeight: 'bold' }}>Staff Login</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              value={staffCredentials.username}
              onChange={(e) => setStaffCredentials({ ...staffCredentials, username: e.target.value })}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: 'white' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                },
              }}
            />
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={staffCredentials.password}
              onChange={(e) => setStaffCredentials({ ...staffCredentials, password: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: 'white' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStaffLoginOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Cancel
            </Button>
            <Button
              onClick={handleStaffLogin}
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
              Login
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
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

        <Fab 
          color="primary" 
          aria-label="cart" 
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
            color: '#1a1a1a',
            '&:hover': {
              background: 'linear-gradient(45deg, #FFA000 30%, #FFD700 90%)',
            }
          }}
          onClick={() => setCartOpen(true)}
        >
          <Badge badgeContent={cart.length} color="error">
            <CartIcon />
          </Badge>
        </Fab>

        {/* Dialog สำหรับเลือกตัวเลือก */}
        <Dialog 
          open={optionDialogOpen} 
          onClose={() => setOptionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            เลือกตัวเลือก - {selectedCoffee?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {Object.entries(menuOptions).map(([type, options]) => (
                <Box key={type} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {type === 'temperature' ? 'อุณหภูมิ' :
                     type === 'sweetness' ? 'ความหวาน' :
                     type === 'toppings' ? 'ท็อปปิ้ง' :
                     type === 'size' ? 'ขนาด' : type}
                  </Typography>
                  <RadioGroup
                    value={selectedOptions[type]?.id || ''}
                    onChange={(e) => {
                      const selectedOption = options.find(opt => opt.id === parseInt(e.target.value));
                      handleOptionChange(type, selectedOption);
                    }}
                  >
                    {options.map((option) => (
                      <FormControlLabel
                        key={option.id}
                        value={option.id}
                        control={<Radio />}
                        label={`${option.option_name} ${option.price_adjustment > 0 ? `(+${option.price_adjustment}฿)` : ''}`}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOptionDialogOpen(false)}>ยกเลิก</Button>
            <Button 
              onClick={handleConfirmAddToCart}
              variant="contained"
              color="primary"
            >
              เพิ่มลงตะกร้า (฿{calculateTotalPrice()})
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Home; 