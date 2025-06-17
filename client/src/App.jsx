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
});

// Component to conditionally render Navbar
const NavbarWrapper = () => {
  const location = useLocation();
  return location.pathname !== '/' ? <Navbar /> : null;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <NavbarWrapper />
          <Box sx={{ pt: location.pathname === '/' ? 0 : 8 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/add-coffee" element={<AddCoffee />} />
              <Route path="/edit-coffee/:id" element={<EditCoffee />} />
              <Route path="/staff" element={<Staff />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
