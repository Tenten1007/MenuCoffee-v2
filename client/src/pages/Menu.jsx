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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Tooltip,
  Zoom,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Menu = () => {
  const [coffees, setCoffees] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coffeeToDelete, setCoffeeToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const categories = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'coffee', label: 'กาแฟ' },
    { value: 'tea', label: 'ชา' },
    { value: 'italian-soda', label: 'อิตาเลี่ยนโซดา' },
    { value: 'bakery', label: 'เบเกอรี่' }
  ];

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/coffees');
      setCoffees(response.data);
    } catch (error) {
      console.error('Error fetching coffees:', error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-coffee/${id}`);
  };

  const handleAddNew = () => {
    navigate('/add-coffee');
  };

  const handleDeleteClick = (coffee) => {
    setCoffeeToDelete(coffee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/coffees/${coffeeToDelete.id}`);
      setCoffees(coffees.filter(coffee => coffee.id !== coffeeToDelete.id));
      setDeleteDialogOpen(false);
      setCoffeeToDelete(null);
    } catch (error) {
      console.error('Error deleting coffee:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const filteredCoffees = coffees.filter(coffee => {
    const matchesSearch = coffee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || coffee.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        paddingTop: { xs: '64px', sm: '72px' },
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
            mb: { xs: 3, sm: 4, md: 6 },
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: 'white',
              textAlign: 'center',
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' }
            }}
          >
            จัดการเมนู
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              mb: 4,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            เพิ่ม แก้ไข หรือลบเมนูได้ที่นี่
          </Typography>

          <TextField
            label="ค้นหาเมนู..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'white',
              },
            }}
          />

          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 4,
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
              },
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: 'white',
                },
              },
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category.value}
                value={category.value}
                label={category.label}
              />
            ))}
          </Tabs>
        </Box>

        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }}
          sx={{
            justifyContent: 'center'
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
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      lineHeight: 1.5,
                      flexGrow: 1
                    }}
                  >
                    {coffee.description}
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
                      {categories.find(cat => cat.value === coffee.category)?.label || coffee.category}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions 
                  sx={{ 
                    p: { xs: 1.5, sm: 2 },
                    justifyContent: 'flex-end',
                    gap: 1
                  }}
                >
                  <Tooltip title="แก้ไข" TransitionComponent={Zoom}>
                    <IconButton 
                      onClick={() => handleEdit(coffee.id)}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        color: 'white',
                        background: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                        }
                      }}
                    >
                      <EditIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="ลบ" TransitionComponent={Zoom}>
                    <IconButton 
                      onClick={() => handleDeleteClick(coffee)}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        color: 'white',
                        background: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                        }
                      }}
                    >
                      <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Tooltip title="เพิ่มเมนูใหม่" placement="left" TransitionComponent={Zoom}>
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              color: '#1a1a1a',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFA000 0%, #FFC107 100%)',
                boxShadow: '0 10px 40px 0 rgba(31, 38, 135, 0.5)',
              }
            }}
            onClick={() => navigate('/add-coffee')}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      </Container>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            width: { xs: '90%', sm: '400px' },
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'white',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          ยืนยันการลบ
        </DialogTitle>
        <DialogContent>
          <Typography 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            คุณต้องการลบ {coffeeToDelete?.name} ใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: { xs: 2, sm: 3 },
            gap: 1
          }}
        >
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            sx={{
              color: 'white',
              background: 'linear-gradient(45deg, #FF4B2B 30%, #FF416C 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF416C 30%, #FF4B2B 90%)',
              },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Menu; 