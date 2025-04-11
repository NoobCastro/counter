import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { DailyStats } from '../types/DailyStats';

interface EditDayDialogProps {
  open: boolean;
  onClose: () => void;
  data: DailyStats;
  date: string;
  onSave: (newData: DailyStats) => void;
}

const EditDayDialog: React.FC<EditDayDialogProps> = ({
  open,
  onClose,
  data,
  date,
  onSave,
}) => {
  const [hours, setHours] = React.useState(data.hours.toString());
  const [interactions, setInteractions] = React.useState(data.interactions.toString());
  const [pace, setPace] = React.useState(data.pace.toString());

  const handleSave = () => {
    const newData: DailyStats = {
      hours: parseFloat(hours) || 0,
      interactions: parseInt(interactions) || 0,
      pace: parseFloat(pace) || 0,
    };
    onSave(newData);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          minWidth: 320,
        }
      }}
    >
      <DialogTitle sx={{ color: '#fff' }}>
        Edit Entry for {date}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
            Hours Worked
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            inputProps={{ step: 0.1, min: 0 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
              }
            }}
          />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
            Interactions
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={interactions}
            onChange={(e) => setInteractions(e.target.value)}
            inputProps={{ step: 1, min: 0 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
              }
            }}
          />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
            Pace
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={pace}
            onChange={(e) => setPace(e.target.value)}
            inputProps={{ step: 0.1, min: 0 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#888' }}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDayDialog; 