import React, { useState } from 'react';
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Card, CardContent, Grid } from '@mui/material';
import { DeleteIcon, RemoveIcon, AddIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const calculateItemTotal = () => {
    const basePrice = parseFloat(item.price);
    const optionsPrice = Object.values(item.selectedOptions || {}).reduce((total, option) => {
      return total + (parseFloat(option.price_adjustment) || 0);
    }, 0);
    return (basePrice + optionsPrice) * item.quantity;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h6">{item.name}</Typography>
            {item.selectedOptions && Object.entries(item.selectedOptions).map(([type, option]) => (
              <Typography key={type} variant="body2" color="text.secondary">
                {type}: {option.option_name} (+{option.price_adjustment} บาท)
              </Typography>
            ))}
            <Typography variant="body2" color="text.secondary">
              ราคาต่อชิ้น: {item.price} บาท
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" justifyContent="flex-end">
              <IconButton 
                size="small" 
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
              <IconButton 
                size="small" 
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              >
                <AddIcon />
              </IconButton>
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => onRemove(item.id)}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Typography variant="subtitle1" align="right" sx={{ mt: 1 }}>
              รวม: {calculateItemTotal()} บาท
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const Cart = () => {
  const renderCartItem = (item) => {
    const optionTypes = {
      temperature: 'อุณหภูมิ',
      sweetness: 'ความหวาน',
      toppings: 'ท็อปปิ้ง',
      size: 'ขนาด'
    };

    return (
      <ListItem
        key={item.id}
        sx={{
          mb: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ListItemText
          primary={item.name}
          secondary={
            <Box>
              {/* แสดงตัวเลือกที่เลือก */}
              {Object.entries(item.selectedOptions || {}).map(([type, option]) => (
                <Typography key={type} variant="body2" color="text.secondary">
                  {optionTypes[type] || type}: {option.option_name}
                  {option.price_adjustment > 0 && ` (+${option.price_adjustment}฿)`}
                </Typography>
              ))}
              <Typography variant="body2" color="text.secondary">
                จำนวน: {item.quantity}
              </Typography>
            </Box>
          }
        />
        <ListItemSecondaryAction>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            ฿{item.totalPrice}
          </Typography>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => handleRemoveFromCart(item)}
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  return (
    <List>
      {/* Render cart items using renderCartItem function */}
    </List>
  );
};

export default Cart; 