import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DailyStats } from '../types/DailyStats';

interface DayData extends DailyStats {
    date: string;
    pace: number;
}

interface MonthData {
    [day: string]: DayData;
}

interface HistoryViewProps {
    selectedMonth: string | null;
    setSelectedMonth: (month: string | null) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ selectedMonth, setSelectedMonth }) => {
    const [monthlyData, setMonthlyData] = useState<{ [month: string]: MonthData }>({});
    const currentYear = new Date().getFullYear();

    // Load and save data when counter changes
    useEffect(() => {
        const loadSavedData = () => {
            const saved = localStorage.getItem('dailyStats');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    setMonthlyData(data);
                } catch (e) {
                    console.error('Error parsing daily stats:', e);
                }
            }
        };

        loadSavedData();
        window.addEventListener('storage', loadSavedData);
        return () => window.removeEventListener('storage', loadSavedData);
    }, []);

    const handleBack = () => {
        setSelectedMonth(null);
    };

    const getExpectedInteractions = (hours: number, pace: number) => {
        return Math.floor(36 * (hours / 8.0) * (pace / 4.5));
    };

    const getDaysInMonth = (month: string) => {
        const monthIndex = months.indexOf(month);
        return new Date(currentYear, monthIndex + 1, 0).getDate();
    };

    const renderDailyView = (monthData: MonthData) => {
        const daysInMonth = getDaysInMonth(selectedMonth!);
        const monthIndex = months.indexOf(selectedMonth!);
        
        // Generate array of all days in the month
        const allDays = Array.from({ length: daysInMonth }, (_, i) => {
            const day = (i + 1).toString().padStart(2, '0');
            const date = new Date(currentYear, monthIndex, i + 1);
            const monthAbbr = date.toLocaleString('default', { month: 'short' });
            return {
                day,
                displayDate: `${monthAbbr} ${day}`,
                data: monthData[day] || null
            };
        });

        return (
            <>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    bgcolor: 'background.paper',
                }}>
                    <Typography sx={{ color: '#888', flex: '1 1 33%', fontWeight: 500 }}>
                        Date
                    </Typography>
                    <Typography sx={{ color: '#888', flex: '1 1 33%', textAlign: 'center', fontWeight: 500 }}>
                        Hours
                    </Typography>
                    <Typography sx={{ color: '#888', width: 36, flex: '0 0 auto', textAlign: 'center', fontWeight: 500 }}>
                        Int.
                    </Typography>
                </Box>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {allDays.map(({ day, displayDate, data }) => (
                        <ListItem
                            key={day}
                            sx={{
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                py: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography sx={{ color: '#fff', flex: '1 1 33%' }}>
                                {displayDate}
                            </Typography>
                            <Typography sx={{ color: '#888', flex: '1 1 33%', textAlign: 'center' }}>
                                {data ? `${data.hours.toFixed(1)}h` : '-'}
                            </Typography>
                            {data ? (
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        backgroundColor: data.interactions >= getExpectedInteractions(data.hours, data.pace) 
                                            ? '#4ade80' 
                                            : '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        flex: '0 0 auto',
                                    }}
                                >
                                    {data.interactions}
                                </Box>
                            ) : (
                                <Box sx={{ width: 36, flex: '0 0 auto', textAlign: 'center', color: '#888' }}>
                                    -
                                </Box>
                            )}
                        </ListItem>
                    ))}
                </List>
            </>
        );
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: -4 }}>
            {selectedMonth ? (
                <>
                    <Box sx={{ mb: 2 }}>
                        <IconButton onClick={handleBack} sx={{ color: '#fff' }}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Box>
                    {renderDailyView(monthlyData[selectedMonth] || {})}
                </>
            ) : (
                <>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            color: '#fff', 
                            mb: 1,
                            mt: 0,
                            textAlign: 'center',
                            fontWeight: 'normal'
                        }}
                    >
                        {currentYear}
                    </Typography>
                    <List sx={{ 
                        width: '100%', 
                        bgcolor: 'background.paper',
                        '& .MuiListItem-root': {
                            py: 1 // Further reduce padding for each list item
                        }
                    }}>
                        {months.map((month) => (
                            <ListItem
                                key={month}
                                onClick={() => setSelectedMonth(month)}
                                sx={{
                                    cursor: 'pointer',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    },
                                }}
                            >
                                <ListItemText primary={month} sx={{ color: '#fff' }} />
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
        </Box>
    );
};

export default HistoryView;