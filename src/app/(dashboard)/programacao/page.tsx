import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';

const scheduleData = [
  { time: '08:00 AM', show: 'Morning Melodies' },
  { time: '10:00 AM', show: 'Talk Time' },
  { time: '12:00 PM', show: 'News Hour' },
  { time: '02:00 PM', show: 'Afternoon Beats' },
  { time: '04:00 PM', show: 'Evening Talks' },
  { time: '06:00 PM', show: 'Night Rhythms' },
];

const SchedulePage = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' gutterBottom>
        Program Schedule
      </Typography>
      <Card>
        <CardContent>
          <List>
            {scheduleData.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={`${item.time} - ${item.show}`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SchedulePage;
