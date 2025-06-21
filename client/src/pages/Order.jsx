import React, { useState, useEffect } from 'react';
import { api } from '../api'; // Use named import
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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';

const Order = () => {
  const [coffees, setCoffees] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    try {
      const response = await api.get('/api/coffees'); // Use api instance
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

  const handleAddToCart = (coffee) => {
    setSelectedCoffee({
      ...coffee,
      quantity: 1,
      sweetness: 'ปกติ',
      temperature: 'ร้อน',
      note: ''
    });
    setOrderDialogOpen(true);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedCoffee) return;

    setCart([...cart, selectedCoffee]);
    setOrderDialogOpen(false);
    setSelectedCoffee(null);
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
        customerName,
        items: cart,
        status: 'รอดำเนินการ',
        orderTime: new Date().toISOString()
      };

      await api.post('/api/orders', orderData); // Use api instance
      setCart([]);
      setCustomerName('');
      setCartOpen(false);
      setSnackbar({
        open: true,
        message: 'สั่งซื้อสำเร็จ! รอรับออเดอร์ของคุณได้เลย',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการสั่งซื้อ',
        severity: 'error'
      });
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
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
        maxWidth={false} 
        sx={{ 
          py: { xs: 3, sm: 4, md: 6 },
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
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
            สั่งกาแฟ
          </Typography>
          <IconButton
            onClick={() => setCartOpen(true)}
            sx={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <Badge badgeContent={cart.length} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
        </Box>

        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }}
          sx={{
            justifyContent: 'center'
          }}
        >
          {coffees.map((coffee) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              key={coffee.id}
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Card 
                sx={{ 
                  width: '100%',
                  maxWidth: 400,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height={isMobile ? "180" : "220"}
                  image={coffee.image}
                  alt={coffee.name}
                  sx={{
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    objectFit: 'cover'
                  }}
                />
                <CardContent 
                  sx={{ 
                    flexGrow: 1, 
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {coffee.name}
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 1
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 600,
                        fontSize: { xs: '1rem', sm: '1.125rem' }
                      }}
                    >
                      ฿{coffee.price}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {coffee.category}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions 
                  sx={{ 
                    p: { xs: 1.5, sm: 2 },
                    justifyContent: 'center'
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => handleAddToCart(coffee)}
                    sx={{
                      background: 'linear-gradient(45deg, #FF4B2B 30%, #FF416C 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FF416C 30%, #FF4B2B 90%)',
                      },
                      width: '100%'
                    }}
                  >
                    เพิ่มลงตะกร้า
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Order Dialog */}
      <Dialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          {selectedCoffee?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>ระดับความหวาน</InputLabel>
              <Select
                value={selectedCoffee?.sweetness || 'ปกติ'}
                onChange={(e) => setSelectedCoffee({...selectedCoffee, sweetness: e.target.value})}
                label="ระดับความหวาน"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                <MenuItem value="ไม่หวาน">ไม่หวาน</MenuItem>
                <MenuItem value="หวานน้อย">หวานน้อย</MenuItem>
                <MenuItem value="ปกติ">ปกติ</MenuItem>
                <MenuItem value="หวานมาก">หวานมาก</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>อุณหภูมิ</InputLabel>
              <Select
                value={selectedCoffee?.temperature || 'ร้อน'}
                onChange={(e) => setSelectedCoffee({...selectedCoffee, temperature: e.target.value})}
                label="อุณหภูมิ"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                <MenuItem value="ร้อน">ร้อน</MenuItem>
                <MenuItem value="เย็น">เย็น</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="หมายเหตุ"
              multiline
              rows={2}
              value={selectedCoffee?.note || ''}
              onChange={(e) => setSelectedCoffee({...selectedCoffee, note: e.target.value})}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => setSelectedCoffee({
                  ...selectedCoffee,
                  quantity: Math.max(1, (selectedCoffee?.quantity || 1) - 1)
                })}
                sx={{ color: 'white' }}
              >
                <RemoveIcon />
              </IconButton>
              <Typography sx={{ color: 'white' }}>
                {selectedCoffee?.quantity || 1}
              </Typography>
              <IconButton
                onClick={() => setSelectedCoffee({
                  ...selectedCoffee,
                  quantity: (selectedCoffee?.quantity || 1) + 1
                })}
                sx={{ color: 'white' }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOrderDialogOpen(false)}
            sx={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirmAddToCart}
            sx={{
              color: 'white',
              background: 'linear-gradient(45deg, #FF4B2B 30%, #FF416C 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF416C 30%, #FF4B2B 90%)',
              }
            }}
          >
            เพิ่มลงตะกร้า
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            ตะกร้าสินค้า
          </Typography>
          {cart.length === 0 ? (
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              ไม่มีสินค้าในตะกร้า
            </Typography>
          ) : (
            <>
              <List>
                {cart.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography sx={{ color: 'white' }}>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {item.temperature} | {item.sweetness}
                            {item.note && ` | ${item.note}`}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Typography sx={{ color: 'white', mr: 2 }}>
                          ฿{item.price * item.quantity}
                        </Typography>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveFromCart(index)}
                          sx={{ color: 'white' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="ชื่อลูกค้า"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
                <Paper
                  sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    mb: 2
                  }}
                >
                  <Typography sx={{ color: 'white' }}>
                    ยอดรวม: ฿{calculateTotal()}
                  </Typography>
                </Paper>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmitOrder}
                  sx={{
                    background: 'linear-gradient(45deg, #FF4B2B 30%, #FF416C 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF416C 30%, #FF4B2B 90%)',
                    }
                  }}
                >
                  สั่งซื้อ
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default Order; 