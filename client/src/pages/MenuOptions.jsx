import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
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
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const MenuOptions = () => {
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    option_type: '',
    option_value: '',
    is_default: false,
  });

  // ดึงข้อมูลประเภทเมนู
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/menu/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // ดึงข้อมูลตัวเลือกทั้งหมด
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get('/api/menu/options');
        setOptions(response.data);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    fetchOptions();
  }, []);

  const handleOpenDialog = (option = null) => {
    if (option) {
      setEditingOption(option);
      setFormData(option);
    } else {
      setEditingOption(null);
      setFormData({
        category: '',
        option_type: '',
        option_value: '',
        is_default: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOption(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingOption) {
        await axios.put(`/api/menu/options/${editingOption.id}`, formData);
      } else {
        await axios.post('/api/menu/options', formData);
      }
      // รีโหลดข้อมูล
      const response = await axios.get('/api/menu/options');
      setOptions(response.data);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving option:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบตัวเลือกนี้ใช่หรือไม่?')) {
      try {
        await axios.delete(`/api/menu/options/${id}`);
        // รีโหลดข้อมูล
        const response = await axios.get('/api/menu/options');
        setOptions(response.data);
      } catch (error) {
        console.error('Error deleting option:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">จัดการตัวเลือกเมนู</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          เพิ่มตัวเลือก
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ประเภทเมนู</TableCell>
              <TableCell>ประเภทตัวเลือก</TableCell>
              <TableCell>ค่า</TableCell>
              <TableCell>ค่าเริ่มต้น</TableCell>
              <TableCell>จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(options).map(([category, categoryOptions]) => (
              categoryOptions.map((option) => (
                <TableRow key={option.id}>
                  <TableCell>{category}</TableCell>
                  <TableCell>{option.option_type}</TableCell>
                  <TableCell>{option.option_value}</TableCell>
                  <TableCell>
                    <Chip
                      label={option.is_default ? 'ใช่' : 'ไม่'}
                      color={option.is_default ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(option)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(option.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingOption ? 'แก้ไขตัวเลือก' : 'เพิ่มตัวเลือกใหม่'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>ประเภทเมนู</InputLabel>
              <Select
                value={formData.category}
                label="ประเภทเมนู"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>ประเภทตัวเลือก</InputLabel>
              <Select
                value={formData.option_type}
                label="ประเภทตัวเลือก"
                onChange={(e) => setFormData({ ...formData, option_type: e.target.value })}
              >
                <MenuItem value="temperature">ประเภทการเสิร์ฟ</MenuItem>
                <MenuItem value="preparation">ประเภทการทำ</MenuItem>
                <MenuItem value="sweetness">ระดับความหวาน</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="ค่า"
              value={formData.option_value}
              onChange={(e) => setFormData({ ...formData, option_value: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>ค่าเริ่มต้น</InputLabel>
              <Select
                value={formData.is_default}
                label="ค่าเริ่มต้น"
                onChange={(e) => setFormData({ ...formData, is_default: e.target.value })}
              >
                <MenuItem value={true}>ใช่</MenuItem>
                <MenuItem value={false}>ไม่</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button onClick={handleSubmit} variant="contained">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuOptions; 