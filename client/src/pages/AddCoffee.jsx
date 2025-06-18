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
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

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
    description: '',
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
    { value: 'temperature', label: 'อุณหภูมิ' },
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
      is_available: optionForm.is_available
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
    data.append('description', formData.description);
    data.append('price', formData.price);
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
        console.log('Sending menu options:', validOptions);
        data.append('menu_options', JSON.stringify(validOptions));
      }
    }

    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      console.log('Form data:', {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        has_options: formData.has_options,
        menu_options: formData.has_options ? menuOptions : null
      });

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
      console.error('Error adding coffee:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มเมนู กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100vw',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        py: { xs: 2, sm: 4, md: 6, lg: 8 },
        position: 'relative',
        overflow: 'hidden',
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
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          position: 'relative',
          zIndex: 1
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 4, md: 6, lg: 8 },
            width: '100%',
            maxWidth: { xs: '100%', sm: '600px', md: '800px', lg: '1000px' },
            mx: 'auto',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}
        >
          <Box sx={{ mb: { xs: 4, sm: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem', lg: '3rem' },
                fontWeight: 'bold',
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              เพิ่มเมนูใหม่
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              กรอกข้อมูลด้านล่างเพื่อเพิ่มเมนูใหม่
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
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
                    color: 'rgba(255, 255, 255, 0.7)'
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff'
                  }
                }}
              />

              <TextField
                required
                fullWidth
                multiline
                rows={isMobile ? 3 : isTablet ? 4 : 6}
                label="รายละเอียด"
                name="description"
                value={formData.description}
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
                    color: 'rgba(255, 255, 255, 0.7)'
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff'
                  }
                }}
              />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
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
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiInputBase-input': {
                      color: '#ffffff'
                    }
                  }}
                />
                {formData.has_options && (
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1, display: 'block' }}>
                    * ราคานี้เป็นราคาพื้นฐาน ราคารวมจะคำนวณจากราคาพื้นฐาน + ราคาเพิ่มเติมของตัวเลือกที่เลือก
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    ตัวเลือกเพิ่มเติม
                  </Typography>
                  <Switch
                    checked={formData.has_options}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        has_options: e.target.checked
                      }));
                      if (!e.target.checked) {
                        setMenuOptions([]);
                      }
                    }}
                    color="primary"
                  />
                </Box>

                {formData.has_options && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleOptionDialogOpen()}
                      sx={{ mb: 2 }}
                    >
                      เพิ่มตัวเลือก
                    </Button>

                    <List>
                      {menuOptions.map((option) => (
                        <ListItem
                          key={option.id}
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <ListItemText
                            primary={option.option_name}
                            secondary={`${optionTypes.find(t => t.value === option.option_type)?.label || option.option_type} - ราคาเพิ่ม ${option.price_adjustment} บาท`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleOptionDialogOpen(option)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteOption(option.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
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
              <Dialog open={optionDialogOpen} onClose={handleOptionDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                  {editingOption ? 'แก้ไขตัวเลือก' : 'เพิ่มตัวเลือกใหม่'}
                </DialogTitle>
                <DialogContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>ประเภทตัวเลือก</InputLabel>
                        <Select
                          value={optionForm.option_type}
                          onChange={(e) => setOptionForm({ ...optionForm, option_type: e.target.value })}
                          label="ประเภทตัวเลือก"
                        >
                          {optionTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        size="small"
                        onClick={() => setOptionTypeDialogOpen(true)}
                        sx={{ mt: 1 }}
                      >
                        + เพิ่มประเภทตัวเลือกใหม่
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="ชื่อตัวเลือก"
                        value={optionForm.option_name}
                        onChange={(e) => setOptionForm({ ...optionForm, option_name: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="ราคาเพิ่มเติม"
                        type="number"
                        value={optionForm.price_adjustment}
                        onChange={(e) => setOptionForm({ ...optionForm, price_adjustment: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography>เปิดใช้งาน</Typography>
                          <Switch
                            checked={optionForm.is_available}
                            onChange={(e) => setOptionForm({ ...optionForm, is_available: e.target.checked })}
                          />
                        </Box>
                      </FormControl>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleOptionDialogClose}>ยกเลิก</Button>
                  <Button onClick={handleOptionSubmit} variant="contained">
                    บันทึก
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Option Type Dialog */}
              <Dialog open={optionTypeDialogOpen} onClose={() => setOptionTypeDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>เพิ่มประเภทตัวเลือกใหม่</DialogTitle>
                <DialogContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="ชื่อประเภท (ภาษาไทย)"
                        value={newOptionType.label}
                        onChange={(e) => setNewOptionType({ ...newOptionType, label: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="รหัสประเภท (ภาษาอังกฤษ)"
                        value={newOptionType.value}
                        onChange={(e) => setNewOptionType({ ...newOptionType, value: e.target.value })}
                        helperText="ใช้ตัวพิมพ์เล็กและเครื่องหมายขีด (-) แทนช่องว่าง"
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOptionTypeDialogOpen(false)}>ยกเลิก</Button>
                  <Button onClick={handleAddOptionType} variant="contained">
                    เพิ่มประเภท
                  </Button>
                </DialogActions>
              </Dialog>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddCoffee; 