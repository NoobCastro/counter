import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import { DailyStats } from '../types/DailyStats';
import MonthlyStats from './MonthlyStats';
import EditDayDialog from './EditDayDialog';
import { saveAs } from 'file-saver';
import { months } from '../constants';

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
    const [monthlyData, setMonthlyData] = useState<{ [year: string]: { [month: string]: MonthData } }>({});
    const [editDay, setEditDay] = useState<{ day: string, data: DailyStats } | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
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

    const handleEdit = (day: string, data: DailyStats) => {
        setEditDay({ day, data });
        setMenuAnchor(null);
    };

    const handleSaveEdit = (newData: DailyStats) => {
        if (selectedMonth && editDay) {
            const updatedMonthData = {
                ...monthlyData,
                [currentYear]: {
                    ...monthlyData[currentYear],
                    [selectedMonth]: {
                        ...monthlyData[currentYear]?.[selectedMonth],
                        [editDay.day]: {
                            ...monthlyData[currentYear]?.[selectedMonth]?.[editDay.day],
                            ...newData,
                        },
                    },
                },
            };
            setMonthlyData(updatedMonthData);
            localStorage.setItem('dailyStats', JSON.stringify(updatedMonthData));
        }
    };

    const handleExport = () => {
        if (selectedMonth && monthlyData[currentYear]?.[selectedMonth]) {
            const data = Object.entries(monthlyData[currentYear][selectedMonth])
                .map(([day, stats]) => {
                    // Extract just the day number from the date
                    const dayNum = day.replace(/^0+/, ''); // Remove leading zeros
                    return {
                        date: `${selectedMonth} ${dayNum}`,
                        hours: Number(stats.hours) || 0, // Ensure hours is a number
                        interactions: stats.interactions,
                        pace: Number(stats.pace) || 0 // Ensure pace is a number
                    };
                })
                .sort((a, b) => {
                    const dateA = new Date(`${a.date}, ${currentYear}`);
                    const dateB = new Date(`${b.date}, ${currentYear}`);
                    return dateA.getTime() - dateB.getTime();
                });

            // Create CSV with explicit column order
            const headers = ['Date', 'Hours', 'Interactions', 'Pace'];
            const rows = data.map(row => {
                const formattedRow = [
                    row.date,
                    row.hours.toFixed(1),
                    row.interactions,
                    row.pace.toFixed(1)
                ];
                return formattedRow.join(',');
            });

            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${selectedMonth}_${currentYear}_stats.csv`);
        }
        setMenuAnchor(null);
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                {data && (
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            setSelectedDay(day);
                                            setMenuAnchor(e.currentTarget);
                                        }}
                                        sx={{ color: '#888' }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                )}
                            </Box>
                        </ListItem>
                    ))}
                </List>
                {selectedMonth && monthlyData[currentYear]?.[selectedMonth] && (
                    <MonthlyStats
                        data={monthlyData[currentYear][selectedMonth]}
                        month={selectedMonth}
                        year={currentYear}
                    />
                )}
            </>
        );
    };

    if (!selectedMonth) {
        return (
            <Box>
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
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {months.map((month) => {
                        const monthData = monthlyData[currentYear]?.[month] || {};
                        const totalInteractions = Object.values(monthData).reduce((sum, day) => sum + day.interactions, 0);
                        const totalHours = Object.values(monthData).reduce((sum, day) => sum + day.hours, 0);
                        const hasData = Object.keys(monthData).length > 0;

                        return (
                            <ListItem
                                component="div"
                                key={month}
                                onClick={() => setSelectedMonth(month)}
                                sx={{
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                    py: 2,
                                    opacity: hasData ? 1 : 0.5,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={month}
                                    secondary={hasData ? `${totalHours.toFixed(1)}h • ${totalInteractions} interactions` : 'No data'}
                                    primaryTypographyProps={{ sx: { color: '#fff' } }}
                                    secondaryTypographyProps={{ sx: { color: '#888' } }}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: -4 }}>
            {selectedMonth ? (
                <>
                    <Box sx={{ 
                        mb: 2, 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 1
                    }}>
                        <IconButton onClick={handleBack} sx={{ color: '#fff' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <IconButton 
                            onClick={handleExport}
                            sx={{ 
                                color: '#fff',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'transform 0.2s ease'
                            }}
                        >
                            <FileDownloadIcon />
                        </IconButton>
                    </Box>
                    {renderDailyView(monthlyData[currentYear][selectedMonth] || {})}
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
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {months.map((month) => {
                            const monthData = monthlyData[currentYear]?.[month] || {};
                            const totalInteractions = Object.values(monthData).reduce((sum, day) => sum + day.interactions, 0);
                            const totalHours = Object.values(monthData).reduce((sum, day) => sum + day.hours, 0);
                            const hasData = Object.keys(monthData).length > 0;

                            return (
                                <ListItem
                                    component="div"
                                    key={month}
                                    onClick={() => setSelectedMonth(month)}
                                    sx={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                        py: 2,
                                        opacity: hasData ? 1 : 0.5,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={month}
                                        secondary={hasData ? `${totalHours.toFixed(1)}h • ${totalInteractions} interactions` : 'No data'}
                                        primaryTypographyProps={{ sx: { color: '#fff' } }}
                                        secondaryTypographyProps={{ sx: { color: '#888' } }}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                </>
            )}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    }
                }}
            >
                <MenuItem 
                    onClick={() => selectedDay && monthlyData[currentYear]?.[selectedMonth!]?.[selectedDay] && 
                        handleEdit(selectedDay, monthlyData[currentYear][selectedMonth!][selectedDay])}
                    sx={{ color: '#fff' }}
                >
                    <EditIcon sx={{ mr: 1, fontSize: 20 }} />
                    Edit Entry
                </MenuItem>
            </Menu>
            {editDay && (
                <EditDayDialog
                    open={Boolean(editDay)}
                    onClose={() => setEditDay(null)}
                    data={editDay.data}
                    date={`${selectedMonth} ${editDay.day}`}
                    onSave={handleSaveEdit}
                />
            )}
        </Box>
    );
};

export default HistoryView;