import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Paper,
  useTheme,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Tooltip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocalCafe,
  Opacity,
  AddCircle,
  Layers,
  Straighten
} from '@mui/icons-material';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const EditCoffee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    base_price: '',
    category: '',
    has_options: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
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

  useEffect(() => {
    fetchCoffee();
    fetchMenuOptions();
  }, [id]);

  const fetchCoffee = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/coffees/${id}`);
      if (response.data) {
        setFormData({
          name: response.data.name || '',
          price: response.data.price || '',
          base_price: response.data.base_price || '',
          category: response.data.category || '',
          has_options: response.data.has_options || false
        });
        setCurrentImage(response.data.image || '');
        setPreviewImage(response.data.image || '');
      }
    } catch (error) {
      console.error('Error fetching coffee:', error);
      setError('ไม่สามารถโหลดข้อมูลกาแฟได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuOptions = async () => {
    try {
      const response = await api.get(`/api/coffees/${id}/options`);
      setMenuOptions(response.data);
    } catch (error) {
      console.error('Error fetching menu options:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(currentImage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('base_price', formData.base_price);
      data.append('category', formData.category);
      data.append('has_options', formData.has_options);

      if (formData.has_options && menuOptions.length > 0) {
        const validOptions = menuOptions.map(opt => ({
          option_type: opt.option_type,
          option_name: opt.option_name,
          price_adjustment: parseFloat(opt.price_adjustment) || 0,
          is_available: opt.is_available
        })).filter(opt => 
          opt.option_type && 
          opt.option_name && 
          opt.price_adjustment !== undefined
        );

        if (validOptions.length > 0) {
          data.append('menu_options', JSON.stringify(validOptions));
        }
      }

      if (imageFile) {
        data.append('image', imageFile);
      } else if (currentImage) {
        data.append('currentImage', currentImage);
      }

      await api.put(`/api/coffees/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/menu');
    } catch (error) {
      console.error('Error updating coffee:', error);
      if (error.response && error.response.data) {
        const errorMsg = error.response.data.details ? error.response.data.details.map(e => e.message).join(', ') : (error.response.data.message || 'ข้อมูลไม่ถูกต้อง');
        setError(`ไม่สามารถอัพเดทข้อมูลกาแฟได้: ${errorMsg}`);
      } else {
        setError('ไม่สามารถอัพเดทข้อมูลกาแฟได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
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

  const handleOptionSubmit = async () => {
    try {
      if (editingOption) {
        await api.put(
          `/api/coffees/${id}/options/${editingOption.id}`,
          optionForm
        );
      } else {
        await api.post(
          `/api/coffees/${id}/options`,
          optionForm
        );
      }
      fetchMenuOptions();
      handleOptionDialogClose();
    } catch (error) {
      console.error('Error saving menu option:', error);
    }
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await api.delete(`/api/coffees/${id}/options/${optionId}`);
      fetchMenuOptions();
    } catch (error) {
      console.error('Error deleting menu option:', error);
    }
  };

  const handleAddOptionType = () => {
    if (newOptionType.value && newOptionType.label) {
      setOptionTypes([...optionTypes, newOptionType]);
      setNewOptionType({ value: '', label: '' });
      setOptionTypeDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography sx={{ color: 'white' }}>{error}</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/menu')}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
            },
          }}
        >
          กลับไปที่เมนู
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100vw',
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
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 1
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, sm: 4, md: 6 },
            maxWidth: '800px',
            mx: 'auto',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: 'white',
              textAlign: 'center',
              mb: 4,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            แก้ไขเมนูกาแฟ
          </Typography>
          <form id="edit-coffee-form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="ชื่อกาแฟ"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="ราคา"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    startAdornment: '฿',
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                />
                <FormControl 
                  fullWidth 
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  <InputLabel>หมวดหมู่</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    label="หมวดหมู่"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: 'rgba(45, 45, 45, 0.95)',
                          backdropFilter: 'blur(10px)',
                          '& .MuiMenuItem-root': {
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&.Mui-selected': {
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                            },
                          },
                        },
                      },
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'center'
                }}
              >
                {previewImage && (
                  <Box
                    component="img"
                    src={previewImage}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      maxWidth: '300px',
                      height: 'auto',
                      borderRadius: '8px',
                      mb: 2
                    }}
                  />
                )}
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
            </Stack>
          </form>

          {/* Menu Options Section */}
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
                <Button onClick={handleOptionSubmit} variant="contained" sx={{ background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 100%)', color: '#1a1a1a', fontWeight: 900, fontSize: '1.1rem', borderRadius: 2, px: 4, py: 1.2, boxShadow: '0 4px 24px 0 rgba(255,215,0,0.10)', letterSpacing: 1, transition: 'all 0.18s', '&:hover': { background: 'linear-gradient(90deg, #FFA000 0%, #FFD700 100%)', color: '#222', transform: 'scale(1.04)', boxShadow: '0 8px 32px 0 rgba(255,215,0,0.18)' } }}>{editingOption ? 'บันทึก' : 'เพิ่ม'}</Button>
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
        </Paper>
        <Box sx={{
          maxWidth: '800px',
          mx: 'auto',
          mt: 4,
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Button
            type="submit"
            variant="contained"
            size={isMobile ? "medium" : "large"}
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: 3,
              borderRadius: 2.5,
              '&:hover': {
                background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                boxShadow: 6,
              },
            }}
            form="edit-coffee-form"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/menu')}
            size={isMobile ? "medium" : "large"}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, rgba(244,67,54,0.85) 0%, rgba(229,57,53,0.85) 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 8px 32px 0 rgba(244,67,54,0.25)',
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              borderRadius: 2.5,
              border: '1.5px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(229,57,53,0.95) 0%, rgba(244,67,54,0.95) 100%)',
                boxShadow: '0 12px 32px 0 rgba(244,67,54,0.35)',
                transform: 'translateY(-2px) scale(1.04)'
              },
            }}
          >
            ยกเลิก
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default EditCoffee; 