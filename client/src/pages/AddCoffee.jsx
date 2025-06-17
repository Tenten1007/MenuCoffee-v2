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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await axios.post('http://localhost:5000/api/coffees', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/menu');
    } catch (error) {
      console.error('Error adding coffee:', error);
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

              <Box 
                sx={{ 
                  display: 'flex',
                  gap: { xs: 2, sm: 3, md: 4 },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="ราคา"
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
              </Box>

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
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddCoffee; 