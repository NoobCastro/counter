import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface CircularProgressViewProps {
    counter: number;
    maxCount: number;
    selectedPace: number;
}

const CircularProgressView: React.FC<CircularProgressViewProps> = ({
    counter,
    maxCount,
    selectedPace
}) => {
    const progress = (counter / maxCount) * 100;
    const extraProgress = counter > maxCount ? ((counter - maxCount) / maxCount) * 100 : 0;

    // Generate tick marks based on maxCount
    const tickMarks = Array.from({ length: maxCount }, (_, i) => {
        const angle = (i * 360) / maxCount;
        return {
            transform: `rotate(${angle}deg)`,
        };
    });

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', width: 200, height: 200 }}>
            {/* Background circle */}
            <CircularProgress
                variant="determinate"
                value={100}
                size={200}
                thickness={1.5}
                sx={{ color: 'rgba(255, 255, 255, 0.1)' }}
            />

            {/* Tick marks container */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                }}
            >
                {tickMarks.map((tick, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: 'absolute',
                            width: '1.5px',
                            height: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            top: '0',
                            left: 'calc(50% - 0.75px)',
                            transformOrigin: '50% 90px',
                            transform: tick.transform,
                        }}
                    />
                ))}
            </Box>

            {/* Progress circle */}
            <CircularProgress
                variant="determinate"
                value={progress > 100 ? 100 : progress}
                size={200}
                thickness={1.5}
                sx={{
                    color: '#4ade80', // Green color
                    position: 'absolute',
                    left: 0,
                }}
            />

            {/* Extra progress circle */}
            {extraProgress > 0 && (
                <CircularProgress
                    variant="determinate"
                    value={extraProgress}
                    size={200}
                    thickness={1.5}
                    sx={{
                        color: '#60a5fa', // Blue color
                        position: 'absolute',
                        left: 0,
                    }}
                />
            )}

            {/* Counter text */}
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography 
                    variant="h2" 
                    component="div" 
                    sx={{ 
                        color: '#fff',
                        fontWeight: 'normal',
                    }}
                >
                    {counter}
                </Typography>
            </Box>
        </Box>
    );
};

export default CircularProgressView;