import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { DailyStats } from '../types/DailyStats';

interface MonthlyStatsProps {
  data: { [day: string]: DailyStats };
  month: string;
  year: number;
}

const MonthlyStats: React.FC<MonthlyStatsProps> = ({ data, month, year }) => {
  const textColor = '#fff';
  const subTextColor = '#888';

  const chartData = Object.entries(data).map(([day, stats]) => ({
    date: format(new Date(year, months.indexOf(month), parseInt(day)), 'MMM d'),
    hours: stats.hours,
    interactions: stats.interactions,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalHours = Object.values(data).reduce((sum, day) => sum + day.hours, 0);
  const totalInteractions = Object.values(data).reduce((sum, day) => sum + day.interactions, 0);
  const avgHoursPerDay = totalHours / Object.keys(data).length || 0;
  const avgInteractionsPerDay = totalInteractions / Object.keys(data).length || 0;

  return (
    <Box sx={{ mt: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ color: textColor, mb: 2 }}>Monthly Overview</Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body2" sx={{ color: subTextColor }}>Total Hours</Typography>
          <Typography variant="h4" sx={{ color: textColor }}>{totalHours.toFixed(1)}</Typography>
          <Typography variant="body2" sx={{ color: subTextColor }}>
            Avg: {avgHoursPerDay.toFixed(1)}/day
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body2" sx={{ color: subTextColor }}>Total Interactions</Typography>
          <Typography variant="h4" sx={{ color: textColor }}>{totalInteractions}</Typography>
          <Typography variant="body2" sx={{ color: subTextColor }}>
            Avg: {avgInteractionsPerDay.toFixed(1)}/day
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, height: 300, bgcolor: 'background.paper' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              stroke={subTextColor}
              tick={{ fill: subTextColor }}
            />
            <YAxis 
              yAxisId="hours"
              stroke={subTextColor}
              tick={{ fill: subTextColor }}
            />
            <YAxis 
              yAxisId="interactions"
              orientation="right"
              stroke={subTextColor}
              tick={{ fill: subTextColor }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#333',
                border: '1px solid #666',
                borderRadius: '4px',
              }}
              labelStyle={{ color: textColor }}
            />
            <Line
              yAxisId="hours"
              type="monotone"
              dataKey="hours"
              stroke="#60a5fa"
              dot={false}
              name="Hours"
            />
            <Line
              yAxisId="interactions"
              type="monotone"
              dataKey="interactions"
              stroke="#4ade80"
              dot={false}
              name="Interactions"
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default MonthlyStats; 