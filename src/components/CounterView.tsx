import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Slider, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CircularProgressView from './CircularProgressView';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
        backgroundColor: theme.palette.background.paper,
        borderRadius: 8,
        fontSize: '1.5rem',
        width: '120px',
        '& input': {
            textAlign: 'center',
            padding: '8px 12px',
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
            },
        }
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
    '& .MuiSlider-rail': {
        opacity: 0.3,
    },
    '& .MuiSlider-track': {
        backgroundColor: theme.palette.primary.main,
    },
    '& .MuiSlider-thumb': {
        backgroundColor: '#fff',
    },
}));

const CounterView: React.FC = () => {
    const [counter, setCounter] = useState(() => Number(localStorage.getItem('counter')) || 0);
    const [queueHours, setQueueHours] = useState(() => Number(localStorage.getItem('queueHours')) || 8);
    const [selectedPace, setSelectedPace] = useState(() => Number(localStorage.getItem('selectedPace')) || 4.5);
    const [paceInputValue, setPaceInputValue] = useState(selectedPace.toString());
    const [maxCount, setMaxCount] = useState(36);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState('0 seconds ago');

    useEffect(() => {
        const lastDate = localStorage.getItem('lastDate');
        const today = new Date().toDateString();
        
        // Force reset data structure
        const resetDataStructure = () => {
            const migrationComplete = localStorage.getItem('dataStructureMigrated2025');
            if (migrationComplete === 'true') {
                return; // Skip if already migrated
            }

            const saved = localStorage.getItem('dailyStats');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    const currentYear = new Date().getFullYear();
                    
                    // Force restructure the data
                    const newData: Record<string, Record<string, any>> = {};
                    for (const key in data) {
                        if (typeof data[key] === 'object') {
                            if (!data[key].hasOwnProperty(currentYear)) {
                                // Old format - migrate it
                                newData[currentYear.toString()] = { ...data };
                                break;
                            } else {
                                // Already in new format
                                newData[key] = data[key];
                            }
                        }
                    }
                    
                    localStorage.setItem('dailyStats', JSON.stringify(newData));
                    localStorage.setItem('dataStructureMigrated2025', 'true');
                    console.log('Data structure reset complete');
                    
                    // Force refresh the page one time only
                    window.location.reload();
                } catch (e) {
                    console.error('Error resetting data structure:', e);
                }
            }
        };

        resetDataStructure();
        
        if (lastDate !== today) {
            localStorage.setItem('lastDate', today);
            localStorage.setItem('counter', '0');
            localStorage.setItem('queueHours', '8');
            setCounter(0);
            setQueueHours(8);
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const elapsedTime = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
            if (elapsedTime < 60) {
                setTimeSinceLastUpdate(`${elapsedTime} seconds ago`);
            } else if (elapsedTime < 3600) {
                setTimeSinceLastUpdate(`${Math.floor(elapsedTime / 60)} minutes ago`);
            } else {
                setTimeSinceLastUpdate(`${Math.floor(elapsedTime / 3600)} hours ago`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [lastUpdated]);

    useEffect(() => {
        localStorage.setItem('counter', counter.toString());
        localStorage.setItem('queueHours', queueHours.toString());
        localStorage.setItem('selectedPace', selectedPace.toString());
    }, [counter, queueHours, selectedPace]);

    const updateCounterForPace = useCallback((pace: number) => {
        const baseInteractionsFor8Hours = 36;
        setMaxCount(Math.floor(baseInteractionsFor8Hours * (queueHours / 8.0) * (pace / 4.5)));
    }, [queueHours]);

    useEffect(() => {
        updateCounterForPace(selectedPace);
    }, [updateCounterForPace, selectedPace]);

    const updateDailyStats = (newCount: number) => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.toLocaleString('default', { month: 'long' });
        const day = today.getDate().toString().padStart(2, '0');
        const monthAbbr = today.toLocaleString('default', { month: 'short' });
        
        const saved = localStorage.getItem('dailyStats') || '{}';
        const dailyStats = JSON.parse(saved);

        if (!dailyStats[year]) {
            dailyStats[year] = {};
        }
        if (!dailyStats[year][month]) {
            dailyStats[year][month] = {};
        }

        dailyStats[year][month][day] = {
            date: `${monthAbbr} ${day}`,
            hours: queueHours,
            interactions: newCount,
            pace: selectedPace
        };

        localStorage.setItem('dailyStats', JSON.stringify(dailyStats));
        // Trigger storage event for HistoryView
        window.dispatchEvent(new Event('storage'));
    };

    const handleIncrement = () => {
        setCounter(prev => {
            const newCount = prev + 1;
            updateDailyStats(newCount);
            return newCount;
        });
        setLastUpdated(new Date());
    };

    const handleDecrement = () => {
        if (counter > 0) {
            setCounter(prev => {
                const newCount = prev - 1;
                updateDailyStats(newCount);
                return newCount;
            });
            setLastUpdated(new Date());
        }
    };

    const handlePaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPaceInputValue(value);
        
        if (value === '') {
            // Don't update selectedPace when input is empty
            return;
        }
        
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            setSelectedPace(numValue);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <CircularProgressView
                counter={counter}
                maxCount={maxCount}
                selectedPace={selectedPace}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ color: '#fff', textAlign: 'center' }}>
                    Set Your Own Pace:
                </Typography>
                <StyledTextField
                    type="number"
                    value={paceInputValue}
                    onChange={handlePaceChange}
                    inputProps={{ 
                        step: 0.1,
                        min: 0,
                        style: { textAlign: 'center' }
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleDecrement}
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                    }}
                >
                    <RemoveIcon sx={{ color: '#fff', fontSize: 30 }} />
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleIncrement}
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.primary.main,
                        },
                    }}
                >
                    <AddIcon sx={{ color: '#fff', fontSize: 30 }} />
                </Button>
            </Box>

            <Box sx={{ width: '100%', maxWidth: 300 }}>
                <Typography sx={{ color: '#fff', mb: 1, textAlign: 'center' }}>
                    On-Queue Hours: {queueHours.toFixed(1)}
                </Typography>
                <StyledSlider
                    value={queueHours}
                    onChange={(_, value) => setQueueHours(value as number)}
                    min={0}
                    max={10}
                    step={0.5}
                />
            </Box>

            <Typography variant="caption" sx={{ color: '#fff' }}>
                {timeSinceLastUpdate}
            </Typography>
        </Box>
    );
};

export default CounterView;