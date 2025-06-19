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
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar, { NAVBAR_HEIGHT } from '../components/Navbar';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleUpdateCartQuantity = (index, newQty) => {
    if (newQty < 1) {
      handleRemoveFromCart(index);
      return;
    }
    setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: newQty } : item));
  };

  const handleConfirmAddToCart = () => {
    // ตรวจสอบว่าผู้ใช้ได้เลือกตัวเลือกครบทุกประเภทหรือไม่
    const allTypesSelected = Object.keys(menuOptions).every(type => selectedOptions[type]);
    if (!allTypesSelected) {
      alert('กรุณาเลือกตัวเลือกให้ครบทุกประเภท');
      return;
    }
    // สร้าง cartItem ใหม่
    const cartItem = {
      id: selectedCoffee.id,
      name: selectedCoffee.name,
      price: selectedCoffee.price,
      quantity: 1,
      totalPrice: calculateTotalPrice(),
      selectedOptions: selectedOptions
    };
    // เช็คว่ามีสินค้า+options เดิมใน cart หรือยัง
    setCart(prev => {
      const foundIndex = prev.findIndex(item =>
        item.id === cartItem.id &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(cartItem.selectedOptions)
      );
      if (foundIndex !== -1) {
        // ถ้ามีอยู่แล้ว เพิ่ม quantity
        return prev.map((item, i) =>
          i === foundIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // ถ้าไม่มี เพิ่มใหม่
        return [...prev, cartItem];
      }
    });
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
    setIsSubmitting(true);
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
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
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
          pt: `${NAVBAR_HEIGHT}px`,
          pb: { xs: '2vh', sm: '4vh' },
          px: { xs: '2vw', sm: '4vw', md: '6vw' },
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
            width: '100%',
            maxWidth: '100vw'
          }}
        >
          {/* Header Section */}
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: { xs: '3vh', sm: '4vh' },
              gap: { xs: '2vh', sm: '3vh' },
              width: '100%'
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: { xs: 'clamp(1.5rem, 5vw, 2.5rem)', sm: 'clamp(1.75rem, 4vw, 2.5rem)' },
                textAlign: 'center',
                fontWeight: 'bold',
                mb: { xs: '1vh', sm: '2vh' }
              }}
            >
              Coffee Menu
            </Typography>
            
            {/* Search and Staff Button */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              gap: { xs: '2vh', sm: '3vh' },
              width: '100%',
              maxWidth: { xs: '90vw', sm: '60vw', md: '50vw' }
            }}>
              <TextField
                label="ค้นหาเมนู"
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    height: { xs: '6vh', sm: '5vh' },
                    '& fieldset': { 
                      borderColor: 'rgba(255,255,255,0.3)',
                      borderRadius: '12px'
                    },
                    '&:hover fieldset': { 
                      borderColor: 'rgba(255,255,255,0.5)' 
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: 'white' 
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: { xs: 'clamp(0.8rem, 2.5vw, 1rem)', sm: 'clamp(0.9rem, 2vw, 1rem)' }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: { xs: 'clamp(1.2rem, 4vw, 1.5rem)', sm: 'clamp(1.3rem, 3vw, 1.5rem)' }
                      }} />
                    </InputAdornment>
                  ),
                }}
              />
              
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
                  width: '100%',
                  maxWidth: { xs: '90vw', sm: '20vw' },
                  minHeight: { xs: '6vh', sm: '5vh' },
                  borderRadius: '12px',
                  fontSize: { xs: 'clamp(0.8rem, 3vw, 1rem)', sm: 'clamp(0.9rem, 2vw, 1rem)' },
                  fontWeight: 'bold'
                }}
              >
                {isLoggedIn ? 'Staff Dashboard' : 'Staff Login'}
              </Button>
            </Box>
          </Box>

          {/* Category Tabs */}
          <Paper
            sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflowX: 'auto',
              mb: { xs: '3vh', sm: '4vh' },
              width: '100%',
              mx: 'auto'
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
                  fontSize: { xs: 'clamp(0.7rem, 2.5vw, 0.9rem)', sm: 'clamp(0.8rem, 2vw, 0.9rem)' },
                  minWidth: { xs: '20vw', sm: '15vw' },
                  padding: { xs: '2vh 1vw', sm: '2.5vh 2vw' },
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 'bold'
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                  height: '3px'
                },
              }}
            >
              {categories.map((category) => (
                <Tab key={category.value} value={category.value} label={category.label} />
              ))}
            </Tabs>
          </Paper>

          {/* Coffee Grid */}
          <Grid 
            container 
            spacing={{ xs: '2vw', sm: '3vw', md: '4vw' }}
            sx={{
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100vw'
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
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  cursor: 'pointer',
                }}
                onClick={() => {/* ใส่ฟังก์ชันนำทางหรือแสดงรายละเอียดเมนูถ้ามี */}}
              >
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: { xs: '80vw', sm: '220px', md: '200px', lg: '180px' },
                    minWidth: { xs: '80vw', sm: '220px', md: '200px', lg: '180px' },
                    maxWidth: { xs: '80vw', sm: '220px', md: '200px', lg: '180px' },
                    minHeight: { sm: '40vh' },
                    background: 'rgba(30,30,30,0.95)',
                    borderRadius: '20px',
                    border: '2px solid rgba(255,215,0,0.13)',
                    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18), 0 1.5px 0 0 rgba(255,215,0,0.08)',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'transform 0.25s cubic-bezier(.4,2,.3,1), box-shadow 0.25s cubic-bezier(.4,2,.3,1)',
                    '&:hover': {
                      transform: 'scale(1.035) translateY(-6px)',
                      boxShadow: '0 12px 32px 0 rgba(255,215,0,0.13), 0 8px 32px 0 rgba(0,0,0,0.25)',
                      borderColor: 'rgba(255,215,0,0.35)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={coffee.image}
                    alt={coffee.name}
                    sx={{
                      width: '100%',
                      height: { xs: '48vw', sm: '36vh', md: '38vh' },
                      maxHeight: { xs: '56vw', sm: '36vh', md: '38vh' },
                      objectFit: 'cover',
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px',
                      display: 'block',
                      position: 'relative',
                    }}
                  />
                  {/* Overlay gradient for image */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: { xs: '48vw', sm: '36vh', md: '38vh' },
                    pointerEvents: 'none',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.01) 60%, rgba(30,30,30,0.45) 100%)',
                  }} />
                  <CardContent
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: { xs: 2, sm: 3 },
                      width: '100%',
                      background: 'none',
                      pb: { xs: 3.5, sm: 4 },
                    }}
                  >
                    <Box sx={{ flex: 1, minHeight: { xs: '10vh', sm: '12vh' }, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          color: '#FFD700',
                          fontWeight: 700,
                          fontSize: { xs: 'clamp(1.1rem, 4vw, 1.4rem)', sm: 'clamp(1.2rem, 2.8vw, 1.4rem)' },
                          lineHeight: 1.18,
                          mb: '1vh',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: { xs: '3vh', sm: '3.5vh' },
                          letterSpacing: 0.5,
                          textShadow: '0 2px 8px rgba(0,0,0,0.18)'
                        }}
                      >
                        {coffee.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: { xs: '2vh', sm: '32px' },
                        mt: 'auto',
                        pt: 1,
                        pb: { xs: 1, sm: 1.5 },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#FFD700',
                          fontWeight: 700,
                          fontSize: { xs: 'clamp(1.15rem, 4vw, 1.35rem)', sm: 'clamp(1.18rem, 2.8vw, 1.35rem)' },
                          letterSpacing: 0.5,
                          textShadow: '0 2px 8px rgba(0,0,0,0.18)'
                        }}
                      >
                        ฿{coffee.price}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddToCart(coffee)}
                        sx={{
                          background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)',
                          color: '#1a1a1a',
                          fontWeight: 700,
                          fontSize: { xs: 'clamp(1.05rem, 3vw, 1.15rem)', sm: 'clamp(1.08rem, 2vw, 1.15rem)' },
                          minHeight: { xs: '5.5vh', sm: '4.8vh' },
                          borderRadius: '12px',
                          px: { xs: 0, sm: '2vw' },
                          width: { xs: '90%', sm: 'auto' },
                          alignSelf: 'center',
                          boxShadow: '0 4px 16px 0 rgba(255,215,0,0.22)',
                          letterSpacing: 0.5,
                          transition: 'all 0.18s cubic-bezier(.4,2,.3,1)',
                          mt: { xs: 1.5, sm: 0 },
                          mb: { xs: 1.2, sm: 1.2 },
                          '&:hover': {
                            background: 'linear-gradient(90deg, #FFA000 0%, #FFD700 100%)',
                            color: '#222',
                            transform: 'scale(1.04)',
                            boxShadow: '0 6px 24px 0 rgba(255,215,0,0.28)',
                          }
                        }}
                      >
                        เพิ่ม
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {filteredCoffees.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: { xs: '8vh', sm: '10vh', md: '12vh' },
              color: 'rgba(255,255,255,0.7)'
            }}>
              <Typography variant="h6" sx={{ 
                mb: '2vh', 
                fontSize: { xs: 'clamp(1rem, 4vw, 1.3rem)', sm: 'clamp(1.1rem, 3vw, 1.3rem)' },
                color: 'white'
              }}>
                ไม่พบเมนูที่ค้นหา
              </Typography>
              <Typography variant="body2" sx={{ 
                fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
              }}>
                ลองเปลี่ยนคำค้นหาหรือหมวดหมู่
              </Typography>
            </Box>
          )}
        </Container>

        {/* Cart Drawer */}
        <Drawer
          anchor="right"
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100vw', sm: '40vw' },
              background: 'rgba(45,45,45,0.95)',
              backdropFilter: 'blur(10px)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
            }
          }}
        >
          <Box sx={{ 
            p: { xs: '3vw', sm: '4vw' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header with Close Button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: '2vh'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: { xs: 'clamp(1.2rem, 4vw, 1.5rem)', sm: 'clamp(1.3rem, 3vw, 1.5rem)' }
                }}
              >
                ตะกร้าสินค้า
              </Typography>
              <IconButton 
                onClick={() => setCartOpen(false)}
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: { xs: 'clamp(1.5rem, 6vw, 2rem)', sm: 'clamp(1.8rem, 4vw, 2rem)' },
                  width: { xs: 'clamp(3rem, 12vw, 4rem)', sm: 'clamp(3.5rem, 8vw, 4rem)' },
                  height: { xs: 'clamp(3rem, 12vw, 4rem)', sm: 'clamp(3.5rem, 8vw, 4rem)' },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: '2vh', borderColor: 'rgba(255,255,255,0.1)' }} />
            
            {/* Content Area */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {cart.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: { xs: '8vh', sm: '10vh' },
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  <CartIcon sx={{ 
                    fontSize: { xs: 'clamp(3rem, 15vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)' }, 
                    mb: '2vh', 
                    opacity: 0.5 
                  }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: '1vh',
                      fontSize: { xs: 'clamp(1rem, 4vw, 1.3rem)', sm: 'clamp(1.1rem, 3vw, 1.3rem)' }
                    }}
                  >
                    ตะกร้าว่างเปล่า
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
                    }}
                  >
                    เพิ่มเมนูเพื่อเริ่มสั่งซื้อ
                  </Typography>
                </Box>
              ) : (
                <List sx={{ 
                  maxHeight: { xs: '45vh', sm: '55vh' }, 
                  overflow: 'auto',
                  mb: '2vh'
                }}>
                  {cart.map((item, index) => (
                    <ListItem key={index} sx={{ 
                      py: { xs: '2vh', sm: '2.5vh' }, 
                      px: 0,
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(.4,2,.3,1)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)',
                        color: '#222',
                        transform: 'scale(1.03)',
                        boxShadow: '0 2px 12px 0 rgba(255,215,0,0.13)',
                        '& .MuiListItemSecondaryAction-root, & .MuiIconButton-root': {
                          color: '#FFA000',
                          transform: 'scale(1.15)',
                          transition: 'all 0.18s cubic-bezier(.4,2,.3,1)'
                        }
                      }
                    }}>
                      <ListItemText
                        primary={
                          <Typography sx={{ 
                            color: 'white',
                            fontSize: { xs: 'clamp(1rem, 3.5vw, 1.2rem)', sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' },
                            fontWeight: 'bold',
                            mb: '0.5vh'
                          }}>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" sx={{ 
                              color: '#FFD700',
                              fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' },
                              fontWeight: 'bold',
                              display: 'block'
                            }}>
                              ฿{item.totalPrice} x {item.quantity}
                            </Typography>
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <Typography component="span" sx={{ 
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: { xs: 'clamp(0.8rem, 2.5vw, 0.95rem)', sm: 'clamp(0.85rem, 2vw, 0.95rem)' },
                                mt: '0.5vh',
                                display: 'block'
                              }}>
                                {Object.values(item.selectedOptions).map(option => option.option_name || option.name).join(', ')}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => handleUpdateCartQuantity(index, item.quantity - 1)}
                          sx={{ color: '#FFD700', mr: 1 }}
                          size="small"
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ color: 'white', mx: 1, minWidth: 24, display: 'inline-block', textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          onClick={() => handleUpdateCartQuantity(index, item.quantity + 1)}
                          sx={{ color: '#FFD700', ml: 1 }}
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveFromCart(index)}
                          sx={{ color: '#ff6b6b', ml: 1 }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            {/* Footer with Total and Buttons */}
            {cart.length > 0 && (
              <Box sx={{ mt: 'auto', pt: '2vh', borderTop: '1px solid rgba(255,255,255,0.1)', gap: 2, display: 'flex', flexDirection: 'column' }}>
                {/* Section: ข้อมูลลูกค้า */}
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 1, letterSpacing: 1 }}>
                  ข้อมูลลูกค้า
                </Typography>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mb: 2 }} />
                <TextField
                  label="ชื่อลูกค้า"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                      </InputAdornment>
                    )
                  }}
                  helperText="กรุณากรอกชื่อเพื่อรับออเดอร์"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      height: { xs: '6vh', sm: '5vh' },
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: 'clamp(1rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
                    }
                  }}
                />
                {/* Section: ยอดรวม */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.5, sm: 2 },
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: 1 }}>
                    รวมทั้งหมด:
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 'bold', letterSpacing: 1 }}>
                    ฿{calculateTotal()}
                  </Typography>
                </Box>
                {/* Section: ปุ่มสั่งซื้อ */}
                <Tooltip title={!customerName.trim() ? 'กรุณากรอกชื่อลูกค้าก่อนสั่งซื้อ' : ''} arrow placement="top">
                  <span>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleSubmitOrder}
                      disabled={!customerName.trim() || isSubmitting}
                      startIcon={<CartIcon />}
                      sx={{
                        background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)',
                        color: '#1a1a1a',
                        fontWeight: 'bold',
                        fontSize: { xs: 'clamp(1rem, 3.5vw, 1.2rem)', sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' },
                        minHeight: { xs: '6vh', sm: '5vh' },
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(255,215,0,0.08)',
                        mb: '2vh',
                        transition: 'all 0.2s',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #FFA000 0%, #FFD700 100%)',
                          color: '#222',
                          transform: 'scale(1.03)'
                        }
                      }}
                    >
                      {isSubmitting ? 'กำลังส่งคำสั่งซื้อ...' : 'สั่งซื้อ'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            )}
            
            {/* Mobile Close Button at Bottom */}
            <Box sx={{ 
              display: { xs: 'flex', sm: 'none' },
              justifyContent: 'center',
              mt: '2vh'
            }}>
              <Button
                variant="outlined"
                onClick={() => setCartOpen(false)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)' },
                  minHeight: { xs: '5vh' },
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white'
                  }
                }}
              >
                ปิด
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* Staff Login Dialog */}
        <Dialog
          open={staffLoginOpen}
          onClose={() => setStaffLoginOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(45,45,45,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              color: 'white',
              m: { xs: '2vw', sm: 0 },
              maxWidth: { xs: '95vw', sm: '80vw', md: '60vw' }
            }
          }}
        >
          <DialogTitle sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: { xs: 'clamp(1.2rem, 4vw, 1.5rem)', sm: 'clamp(1.3rem, 3vw, 1.5rem)' },
            textAlign: 'center'
          }}>
            Staff Login
          </DialogTitle>
          <DialogContent sx={{ p: { xs: '3vw', sm: '4vw' } }}>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              value={staffCredentials.username}
              onChange={(e) => setStaffCredentials({ ...staffCredentials, username: e.target.value })}
              sx={{
                mb: '2vh',
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  height: { xs: '6vh', sm: '5vh' },
                  '& fieldset': { 
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '8px'
                  },
                  '&:hover fieldset': { 
                    borderColor: 'rgba(255,255,255,0.5)' 
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: 'white' 
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
                },
                '& .MuiInputBase-input': {
                  fontSize: { xs: 'clamp(1rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
                }
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
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  height: { xs: '6vh', sm: '5vh' },
                  '& fieldset': { 
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '8px'
                  },
                  '&:hover fieldset': { 
                    borderColor: 'rgba(255,255,255,0.5)' 
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: 'white' 
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
                },
                '& .MuiInputBase-input': {
                  fontSize: { xs: 'clamp(1rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: '3vw', sm: '4vw' },
            gap: { xs: '1vw', sm: '2vw' }
          }}>
            <Button 
              onClick={() => setStaffLoginOpen(false)} 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStaffLogin}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
                color: '#1a1a1a',
                fontWeight: 600,
                fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' },
                minHeight: { xs: '5vh', sm: '4.5vh' },
                borderRadius: '8px',
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
          sx={{
            '& .MuiSnackbarContent-root': {
              borderRadius: '12px',
              fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
            }
          }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Fab 
          color="primary" 
          aria-label="cart" 
          sx={{
            position: 'fixed',
            bottom: { xs: '2vh', sm: '3vh' },
            right: { xs: '2vw', sm: '3vw' },
            background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
            color: '#1a1a1a',
            width: { xs: 'clamp(3rem, 12vw, 4rem)', sm: 'clamp(3.5rem, 8vw, 4rem)' },
            height: { xs: 'clamp(3rem, 12vw, 4rem)', sm: 'clamp(3.5rem, 8vw, 4rem)' },
            '&:hover': {
              background: 'linear-gradient(45deg, #FFA000 30%, #FFD700 90%)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease'
          }}
          onClick={() => setCartOpen(true)}
        >
          <Badge 
            badgeContent={cart.length} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: { xs: 'clamp(0.7rem, 2.5vw, 0.9rem)', sm: 'clamp(0.8rem, 2vw, 0.9rem)' },
                minWidth: { xs: 'clamp(1.2rem, 4vw, 1.5rem)', sm: 'clamp(1.3rem, 3vw, 1.5rem)' },
                height: { xs: 'clamp(1.2rem, 4vw, 1.5rem)', sm: 'clamp(1.3rem, 3vw, 1.5rem)' }
              }
            }}
          >
            <CartIcon sx={{ 
              fontSize: { xs: 'clamp(1.5rem, 5vw, 2rem)', sm: 'clamp(1.8rem, 4vw, 2rem)' } 
            }} />
          </Badge>
        </Fab>

        {/* Dialog สำหรับเลือกตัวเลือก */}
        <Dialog 
          open={optionDialogOpen} 
          onClose={() => setOptionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              background: 'rgba(45,45,45,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              m: { xs: '2vw', sm: 0 },
              maxWidth: { xs: '95vw', sm: '80vw', md: '60vw' }
            }
          }}
        >
          <DialogTitle sx={{ 
            fontSize: { xs: 'clamp(1.1rem, 4vw, 1.4rem)', sm: 'clamp(1.2rem, 3vw, 1.4rem)' },
            color: 'white',
            fontWeight: 'bold'
          }}>
            เลือกตัวเลือก - {selectedCoffee?.name}
          </DialogTitle>
          <DialogContent sx={{ p: { xs: '3vw', sm: '4vw' } }}>
            <Box sx={{ mt: '1vh' }}>
              {Object.entries(menuOptions).map(([type, options]) => (
                <Box key={type} sx={{ mb: { xs: '2vh', sm: '3vh' } }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: '1vh',
                      fontSize: { xs: 'clamp(1rem, 3.5vw, 1.2rem)', sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' },
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
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
                        control={
                          <Radio 
                            sx={{
                              color: 'rgba(255,255,255,0.7)',
                              fontSize: { xs: 'clamp(1.2rem, 4vw, 1.5rem)', sm: 'clamp(1.3rem, 3vw, 1.5rem)' },
                              '&.Mui-checked': {
                                color: '#FFD700'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
                          }}>
                            {option.option_name} 
                            {option.price_adjustment > 0 && (
                              <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                                {` (+${option.price_adjustment}฿)`}
                              </span>
                            )}
                          </Typography>
                        }
                        sx={{ mb: '1vh' }}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: '3vw', sm: '4vw' },
            gap: { xs: '1vw', sm: '2vw' }
          }}>
            <Button 
              onClick={() => setOptionDialogOpen(false)}
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' }
              }}
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleConfirmAddToCart}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', sm: 'clamp(1rem, 2.5vw, 1.1rem)' },
                minHeight: { xs: '5vh', sm: '4.5vh' },
                borderRadius: '8px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FFA000 30%, #FFD700 90%)',
                }
              }}
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
