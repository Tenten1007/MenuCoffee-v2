import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  useTheme,
  useMediaQuery,
  Stack,
  Switch,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AddCircle,
  LocalCafe,
  Opacity,
  Layers,
  Straighten
} from '@mui/icons-material';
import Navbar, { NAVBAR_HEIGHT } from '../components/Navbar';

const categories = [
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

const AddCoffee = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    has_options: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [menuOptions, setMenuOptions] = useState([]);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [optionForm, setOptionForm] = useState({
    option_type: '',
    option_name: '',
    price_adjustment: '',
    is_available: true
  });

  const [optionTypes, setOptionTypes] = useState([
    { value: 'menu-type', label: 'ประเภทเมนู' },
    { value: 'sweetness', label: 'ความหวาน' },
    { value: 'toppings', label: 'ท็อปปิ้ง' },
    { value: 'size', label: 'ขนาด' }
  ]);

  const [newOptionType, setNewOptionType] = useState({ value: '', label: '' });
  const [optionTypeDialogOpen, setOptionTypeDialogOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionDialogOpen = (option = null) => {
    if (option) {
      setEditingOption(option);
      setOptionForm({
        option_type: option.option_type,
        option_name: option.option_name,
        price_adjustment: option.price_adjustment,
        is_available: option.is_available
      });
    } else {
      setEditingOption(null);
      setOptionForm({
        option_type: '',
        option_name: '',
        price_adjustment: '',
        is_available: true
      });
    }
    setOptionDialogOpen(true);
  };

  const handleOptionDialogClose = () => {
    setOptionDialogOpen(false);
    setEditingOption(null);
    setOptionForm({
      option_type: '',
      option_name: '',
      price_adjustment: '',
      is_available: true
    });
  };

  const handleOptionSubmit = () => {
    if (!optionForm.option_type) {
      alert('กรุณาเลือกประเภทตัวเลือก');
      return;
    }
    if (!optionForm.option_name) {
      alert('กรุณาระบุชื่อตัวเลือก');
      return;
    }
    if (optionForm.price_adjustment === '') {
      alert('กรุณาระบุราคาเพิ่มเติม');
      return;
    }

    const newOption = {
      option_type: optionForm.option_type,
      option_name: optionForm.option_name,
      price_adjustment: parseFloat(optionForm.price_adjustment) || 0,
      is_available: true
    };

    if (editingOption) {
      setMenuOptions(prev => prev.map(opt => 
        opt.id === editingOption.id ? { ...newOption, id: opt.id } : opt
      ));
    } else {
      setMenuOptions(prev => [...prev, { ...newOption, id: Date.now() }]);
    }
    handleOptionDialogClose();
  };

  const handleDeleteOption = (optionId) => {
    setMenuOptions(prev => prev.filter(opt => opt.id !== optionId));
  };

  const handleAddOptionType = () => {
    if (newOptionType.value && newOptionType.label) {
      setOptionTypes([...optionTypes, newOptionType]);
      setNewOptionType({ value: '', label: '' });
      setOptionTypeDialogOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('has_options', formData.has_options);

    if (formData.has_options && menuOptions.length > 0) {
      data.append('menu_options', JSON.stringify(menuOptions));
    }

    if (imageFile) {
      data.append('image', imageFile);
    }

    for (let pair of data.entries()) {
      console.log(pair[0]+ ':', pair[1]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/coffees', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        navigate('/menu');
      } else {
        throw new Error(response.data.message || 'เกิดข้อผิดพลาดในการเพิ่มเมนู');
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert('ชื่อเมนูนี้ถูกใช้ไปแล้ว กรุณาตั้งชื่อใหม่');
      } else {
        console.error('Error adding coffee:', error);
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มเมนู กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  return (
    <>
      <Navbar />
      <Box 
        sx={{ 
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
          position: 'relative',
          overflowX: 'hidden',
          paddingTop: `${NAVBAR_HEIGHT}px`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container 
          maxWidth={false} 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            position: 'relative',
            zIndex: 1
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              width: '100%',
              maxWidth: { xs: '100%', sm: '600px', md: '800px' },
              mx: 'auto',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
          >
            <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                เพิ่มเมนูใหม่
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                กรอกข้อมูลด้านล่างเพื่อเพิ่มเมนูใหม่
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={{ xs: 2, sm: 3, md: 4 }}>
                <TextField
                  required
                  fullWidth
                  label="ชื่อเมนู"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      },
                      '&.Mui-focused': {
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    },
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />

                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: { xs: 1, sm: 2 }, 
                      color: 'white',
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    ราคา
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="ราคาพื้นฐาน"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }}>฿</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        },
                        '&.Mui-focused': {
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      },
                      '& .MuiInputBase-input': {
                        color: '#ffffff',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  />
                </Box>

                <TextField
                  required
                  fullWidth
                  select
                  label="หมวดหมู่"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  size={isMobile ? "small" : "medium"}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          backgroundColor: 'rgba(45, 45, 45, 0.95)',
                          backdropFilter: 'blur(10px)',
                          '& .MuiMenuItem-root': {
                            py: 1.5,
                            px: 2,
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(255, 255, 255, 0.15)',
                              color: '#ffffff'
                            }
                          }
                        }
                      }
                    }
                  }}
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1.5,
                      px: 2,
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      color: '#ffffff'
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      },
                      '&.Mui-focused': {
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  required
                  fullWidth
                  type="file"
                  label="รูปภาพเมนู"
                  name="image"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      },
                      '&.Mui-focused': {
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiInputBase-input': {
                      color: '#ffffff'
                    }
                  }}
                />

                {imagePreview && (
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: '200px', sm: '300px', md: '400px' },
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(5px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& img': {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }
                    }}
                  >
                    <img src={imagePreview} alt="Preview" />
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.08)', boxShadow: '0 2px 12px 0 rgba(255,215,0,0.08)', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                        ตัวเลือกเพิ่มเติม
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={formData.has_options}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, has_options: e.target.checked }));
                            if (!e.target.checked) setMenuOptions([]);
                          }}
                          color="primary"
                        />
                        <Typography component="span" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          เปิดใช้งาน
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ opacity: formData.has_options ? 1 : 0.4, pointerEvents: formData.has_options ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Tooltip title="Preset: ประเภทเมนู (ร้อน/เย็น/ปั่น)" arrow>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 0, borderRadius: '50%', p: 1.2, color: '#FFD700', borderColor: '#FFD700', background: 'rgba(255,215,0,0.08)', '&:hover': { background: 'rgba(255,215,0,0.18)' } }}
                            onClick={() => {
                              const preset = [
                                { option_type: 'menu-type', option_name: 'ร้อน', price_adjustment: 0, is_available: true, id: Date.now() + 1 },
                                { option_type: 'menu-type', option_name: 'เย็น', price_adjustment: 5, is_available: true, id: Date.now() + 2 },
                                { option_type: 'menu-type', option_name: 'ปั่น', price_adjustment: 10, is_available: true, id: Date.now() + 3 },
                              ];
                              setMenuOptions(prev => ([
                                ...prev,
                                ...preset.filter(p => !prev.some(opt => opt.option_type === 'menu-type' && opt.option_name === p.option_name))
                              ]));
                            }}
                          >
                            <LocalCafe />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Preset: ระดับความหวาน" arrow>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 0, borderRadius: '50%', p: 1.2, color: '#2196F3', borderColor: '#2196F3', background: 'rgba(33,150,243,0.08)', '&:hover': { background: 'rgba(33,150,243,0.18)' } }}
                            onClick={() => {
                              const preset = [
                                { option_type: 'sweetness', option_name: 'ไม่หวาน', price_adjustment: 0, is_available: true, id: Date.now() + 11 },
                                { option_type: 'sweetness', option_name: 'หวานน้อย', price_adjustment: 0, is_available: true, id: Date.now() + 12 },
                                { option_type: 'sweetness', option_name: 'ปกติ', price_adjustment: 0, is_available: true, id: Date.now() + 13 },
                                { option_type: 'sweetness', option_name: 'หวานมาก', price_adjustment: 0, is_available: true, id: Date.now() + 14 },
                              ];
                              setMenuOptions(prev => ([
                                ...prev,
                                ...preset.filter(p => !prev.some(opt => opt.option_type === 'sweetness' && opt.option_name === p.option_name))
                              ]));
                            }}
                          >
                            <Opacity />
                          </Button>
                        </Tooltip>
                        <Tooltip title="เพิ่มตัวเลือกใหม่" arrow>
                          <Button
                            variant="contained"
                            startIcon={<AddCircle sx={{ fontSize: 28 }} />}
                            sx={{
                              background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)',
                              color: '#1a1a1a',
                              fontWeight: 700,
                              borderRadius: 3,
                              px: 3,
                              py: 1.2,
                              boxShadow: '0 4px 16px 0 rgba(255,215,0,0.12)',
                              transition: 'all 0.18s',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #FFA000 0%, #FFD700 100%)',
                                color: '#222',
                                transform: 'scale(1.04)',
                                boxShadow: '0 6px 24px 0 rgba(255,215,0,0.18)'
                              }
                            }}
                            onClick={() => handleOptionDialogOpen()}
                          >
                            เพิ่มตัวเลือก
                          </Button>
                        </Tooltip>
                      </Box>
                      <List sx={{ mt: 2 }}>
                        {menuOptions.length === 0 && (
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', mb: 1, ml: 2 }}>
                            ยังไม่มีตัวเลือกเพิ่มเติม
                          </Typography>
                        )}
                        {menuOptions.map((option) => (
                          <ListItem
                            key={option.id}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.10)',
                              mb: 1,
                              borderRadius: 2,
                              border: '1px solid rgba(255,215,0,0.13)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2
                            }}
                          >
                            <Chip
                              label={optionTypes.find(t => t.value === option.option_type)?.label || option.option_type}
                              color={option.option_type === 'menu-type' ? 'warning' : option.option_type === 'sweetness' ? 'info' : 'default'}
                              icon={option.option_type === 'menu-type' ? <LocalCafe /> : option.option_type === 'sweetness' ? <Opacity /> : option.option_type === 'toppings' ? <Layers /> : option.option_type === 'size' ? <Straighten /> : null}
                              sx={{ mr: 2, fontWeight: 600, fontSize: '0.95rem', px: 1.5, background: 'rgba(255,215,0,0.13)' }}
                            />
                            <ListItemText
                              primary={<Typography sx={{ color: 'white', fontWeight: 600 }}>{option.option_name}</Typography>}
                              secondary={<Typography sx={{ color: '#FFD700', fontWeight: 500, fontSize: '0.95rem' }}>+{option.price_adjustment} บาท</Typography>}
                            />
                            <Tooltip title="แก้ไข" arrow>
                              <IconButton edge="end" aria-label="edit" onClick={() => handleOptionDialogOpen(option)} sx={{ color: '#2196F3', mr: 1, background: 'rgba(33,150,243,0.08)', borderRadius: '50%' }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบ" arrow>
                              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteOption(option.id)} sx={{ color: '#ff4444', background: 'rgba(255,68,68,0.08)', borderRadius: '50%' }}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Paper>
                </Box>

                <Box 
                  sx={{ 
                    display: 'flex',
                    gap: { xs: 2, sm: 3 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'flex-end',
                    mt: { xs: 2, sm: 3, md: 4 },
                    pt: { xs: 2, sm: 3, md: 4 },
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/menu')}
                    size={isMobile ? "medium" : "large"}
                    sx={{ 
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 3, sm: 4, md: 6 },
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      borderRadius: 2,
                      color: '#ffffff',
                      borderColor: '#ff4444',
                      backgroundColor: 'rgba(255, 68, 68, 0.1)',
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 68, 68, 0.2)',
                        borderColor: '#ff4444',
                        color: '#ffffff',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 15px rgba(255, 68, 68, 0.3)'
                      },
                      '&:active': {
                        transform: 'translateY(1px)',
                        backgroundColor: 'rgba(255, 68, 68, 0.3)'
                      }
                    }}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    sx={{ 
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 3, sm: 4, md: 6 },
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#000000',
                      textShadow: '0 1px 2px rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FFC107 0%, #FF8C00 100%)',
                        boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        transform: 'translateY(1px)',
                        boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)'
                      }
                    }}
                  >
                    เพิ่มเมนู
                  </Button>
                </Box>

                {/* Option Dialog */}
                <Dialog open={optionDialogOpen} onClose={handleOptionDialogClose} maxWidth="xs" fullWidth>
                  <Paper elevation={3} sx={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(45,45,45,0.82) 100%)', backdropFilter: 'blur(18px)', borderRadius: 4, p: 2, border: '2px solid #FFD700', boxShadow: '0 4px 24px 0 rgba(255,215,0,0.10)' }}>
                    <DialogTitle sx={{ color: '#FFD700', fontWeight: 900, fontSize: '1.5rem', textAlign: 'center', mb: 1 }}>{editingOption ? 'แก้ไขตัวเลือก' : 'เพิ่มตัวเลือกใหม่'}</DialogTitle>
                    <DialogContent>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>ประเภทตัวเลือก</InputLabel>
                            <Select
                              value={optionForm.option_type}
                              onChange={(e) => setOptionForm({ ...optionForm, option_type: e.target.value })}
                              label="ประเภทตัวเลือก"
                              sx={{ borderRadius: 2, background: 'rgba(255,255,255,0.10)' }}
                            >
                              {optionTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button size="small" onClick={() => setOptionTypeDialogOpen(true)} sx={{ mt: 1, color: '#FFD700' }}>+ เพิ่มประเภทตัวเลือกใหม่</Button>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="ชื่อตัวเลือก"
                            value={optionForm.option_name}
                            onChange={(e) => setOptionForm({ ...optionForm, option_name: e.target.value })}
                            InputProps={{ sx: { borderRadius: 2, background: 'rgba(255,255,255,0.10)' } }}
                            helperText={!optionForm.option_name ? 'กรุณาระบุชื่อตัวเลือก' : ''}
                            error={!optionForm.option_name}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="ราคาเพิ่มเติม"
                            type="number"
                            value={optionForm.price_adjustment}
                            onChange={(e) => setOptionForm({ ...optionForm, price_adjustment: e.target.value })}
                            InputProps={{ sx: { borderRadius: 2, background: 'rgba(255,255,255,0.10)' } }}
                            helperText={optionForm.price_adjustment === '' ? 'กรุณาระบุราคาเพิ่มเติม' : ''}
                            error={optionForm.price_adjustment === ''}
                          />
                        </Grid>
                      </Grid>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', gap: 2, mt: 1 }}>
                      <Button onClick={handleOptionDialogClose} sx={{ color: '#FFD700', border: '1.5px solid #FFD700', borderRadius: 2, fontWeight: 700, px: 3, py: 1, background: 'rgba(255,255,255,0.10)', '&:hover': { background: 'rgba(255,255,255,0.18)', borderColor: '#FFA000', color: '#FFA000', transform: 'scale(1.04)' } }}>ยกเลิก</Button>
                      <Button onClick={handleOptionSubmit} variant="contained" sx={{ background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)', color: '#1a1a1a', fontWeight: 900, fontSize: '1.1rem', borderRadius: 2, px: 4, py: 1.2, boxShadow: '0 4px 24px 0 rgba(255,215,0,0.10)', letterSpacing: 1, transition: 'all 0.18s', '&:hover': { background: 'linear-gradient(90deg, #FFA000 0%, #FFD700 100%)', color: '#222', transform: 'scale(1.04)', boxShadow: '0 8px 32px 0 rgba(255,215,0,0.18)' } }}>บันทึก</Button>
                    </DialogActions>
                  </Paper>
                </Dialog>

                {/* Option Type Dialog */}
                <Dialog open={optionTypeDialogOpen} onClose={() => setOptionTypeDialogOpen(false)} maxWidth="xs" fullWidth>
                  <Paper elevation={3} sx={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(45,45,45,0.82) 100%)', backdropFilter: 'blur(18px)', borderRadius: 4, p: 2, border: '2px solid #FFD700', boxShadow: '0 4px 24px 0 rgba(255,215,0,0.10)' }}>
                    <DialogTitle sx={{ color: '#FFD700', fontWeight: 900, fontSize: '1.5rem', textAlign: 'center', mb: 1 }}>เพิ่มประเภทตัวเลือกใหม่</DialogTitle>
                    <DialogContent>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="ชื่อประเภท (ภาษาไทย)"
                            value={newOptionType.label}
                            onChange={(e) => setNewOptionType({ ...newOptionType, label: e.target.value })}
                            InputProps={{ sx: { borderRadius: 2, background: 'rgba(255,255,255,0.10)' } }}
                            helperText={!newOptionType.label ? 'กรุณาระบุชื่อประเภท (ภาษาไทย)' : ''}
                            error={!newOptionType.label}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="รหัสประเภท (ภาษาอังกฤษ)"
                            value={newOptionType.value}
                            onChange={(e) => setNewOptionType({ ...newOptionType, value: e.target.value })}
                            InputProps={{ sx: { borderRadius: 2, background: 'rgba(255,255,255,0.10)' } }}
                            helperText="ใช้ตัวพิมพ์เล็กและเครื่องหมายขีด (-) แทนช่องว่าง"
                            error={!newOptionType.value}
                          />
                        </Grid>
                      </Grid>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', gap: 2, mt: 1 }}>
                      <Button onClick={() => setOptionTypeDialogOpen(false)} sx={{ color: '#FFD700', border: '1.5px solid #FFD700', borderRadius: 2, fontWeight: 700, px: 3, py: 1, background: 'rgba(255,255,255,0.10)', '&:hover': { background: 'rgba(255,255,255,0.18)', borderColor: '#FFA000', color: '#FFA000', transform: 'scale(1.04)' } }}>ยกเลิก</Button>
                      <Button onClick={handleAddOptionType} variant="contained" sx={{ background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)', color: '#1a1a1a', fontWeight: 900, fontSize: '1.1rem', borderRadius: 2, px: 4, py: 1.2, boxShadow: '0 4px 24px 0 rgba(255,215,0,0.10)', letterSpacing: 1, transition: 'all 0.18s', '&:hover': { background: 'linear-gradient(90deg, #FFA000 0%, #FFD700 100%)', color: '#222', transform: 'scale(1.04)', boxShadow: '0 8px 32px 0 rgba(255,215,0,0.18)' } }}>เพิ่มประเภท</Button>
                    </DialogActions>
                  </Paper>
                </Dialog>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default AddCoffee; 