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
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import axios from 'axios';

const EditCoffee = () => {
  const { id } = useParams();
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
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const categories = [
    { value: 'coffee', label: 'กาแฟ' },
    { value: 'tea', label: 'ชา' },
    { value: 'italian-soda', label: 'อิตาเลี่ยนโซดา' },
    { value: 'bakery', label: 'เบเกอรี่' }
  ];

  useEffect(() => {
    fetchCoffee();
  }, [id]);

  const fetchCoffee = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/coffees/${id}`);
      if (response.data) {
        setFormData({
          name: response.data.name || '',
          description: response.data.description || '',
          price: response.data.price || '',
          category: response.data.category || '',
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
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      if (imageFile) {
        data.append('image', imageFile);
      } else if (currentImage) {
        data.append('currentImage', currentImage);
      }

      await axios.put(`http://localhost:5000/api/coffees/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/menu');
    } catch (error) {
      console.error('Error updating coffee:', error);
      setError('ไม่สามารถอัพเดทข้อมูลกาแฟได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
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
          <form onSubmit={handleSubmit}>
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
              <TextField
                fullWidth
                label="รายละเอียด"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={4}
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
            <Box 
              sx={{ 
                mt: 4,
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center'
              }}
            >
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
                  '&:hover': {
                    background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                  },
                }}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/menu')}
                size={isMobile ? "medium" : "large"}
                disabled={loading}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                ยกเลิก
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default EditCoffee; 