import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Tab, Tabs } from '@mui/material';
import CounterView from './components/CounterView';
import HistoryView from './components/HistoryView';

const StyledTabs = styled(Tabs)({
  minHeight: 70,
  '& .MuiTabs-flexContainer': {
    gap: '16px',
    padding: '15px',
  },
});

const StyledTab = styled(Tab)({
  color: '#888',
  fontSize: '0.95rem',
  letterSpacing: '0.05em',
  fontWeight: 600,
  minHeight: 44,
  minWidth: 130,
  padding: '8px 32px',
  borderRadius: 22,
  textTransform: 'uppercase',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  '&.Mui-selected': {
    color: '#fff',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    background: 'linear-gradient(180deg, rgba(96, 165, 250, 0.2) 0%, rgba(96, 165, 250, 0.1) 100%)',
    boxShadow: '0 4px 20px rgba(96, 165, 250, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Light blue color for active elements
    },
    background: {
      default: '#1c1c1e', // Darker background color
      paper: 'rgba(44, 44, 46, 0.9)', // Slightly lighter for elevated surfaces
    },
  },
  components: {
    MuiTabs: {
      styleOverrides: {
        indicator: {
          display: 'none', // Remove the underline indicator
        },
      },
    },
  },
});

function App() {
  const [value, setValue] = React.useState(0);
  const [selectedMonth, setSelectedMonth] = React.useState<string | null>(null);
  const [historyScrollPosition, setHistoryScrollPosition] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // Save scroll position when leaving History tab
    if (value === 1) {
      setHistoryScrollPosition(window.scrollY);
    }
    setValue(newValue);
  };

  // Restore scroll position when returning to History tab
  React.useEffect(() => {
    if (value === 1 && historyScrollPosition > 0) {
      window.scrollTo(0, historyScrollPosition);
    }
  }, [value, historyScrollPosition]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          width: '100%', 
          minHeight: '100vh', 
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 0,
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
          }}>
            <StyledTabs 
              value={value} 
              onChange={handleChange} 
              centered
            >
              <StyledTab label="Counter" />
              <StyledTab label="History" />
            </StyledTabs>
          </Box>
          <Box ref={contentRef} sx={{ p: 3, flex: 1 }}>
            {value === 0 && <CounterView />}
            {value === 1 && <HistoryView selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />}
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;