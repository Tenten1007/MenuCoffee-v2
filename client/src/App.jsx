import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import AddCoffee from './pages/AddCoffee';
import EditCoffee from './pages/EditCoffee';
import Staff from './pages/Staff';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B4513',
    },
    secondary: {
      main: '#D2691E',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  typography: {
    h1: {
      fontSize: 'clamp(2rem, 5vw, 3.2rem)',
      lineHeight: 1.1,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h3: {
      fontSize: 'clamp(1.2rem, 3vw, 2rem)',
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '1.2rem',
      },
    },
    body1: {
      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
      lineHeight: 1.6,
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    button: {
      fontSize: 'clamp(0.8rem, 2vw, 1rem)',
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width:768px)': {
            minHeight: '44px',
            minWidth: '44px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '@media (max-width:768px)': {
            '& input': {
              fontSize: '16px',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            margin: '8px',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Box sx={{ 
            pt: { xs: 7, sm: 8 },
            minHeight: '100vh',
            overflowX: 'hidden'
          }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/add-coffee" element={<AddCoffee />} />
              <Route path="/edit-coffee/:id" element={<EditCoffee />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
