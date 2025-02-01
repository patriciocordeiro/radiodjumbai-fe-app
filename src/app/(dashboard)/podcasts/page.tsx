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

const podcastData = [
  { title: 'Episode 1: Introduction to Radio Life', duration: '15:30' },
  { title: 'Episode 2: The History of Radio Broadcasting', duration: '22:45' },
  { title: 'Episode 3: Meet the Hosts', duration: '18:10' },
  { title: 'Episode 4: Behind the Scenes of Radio Life', duration: '30:20' },
];

const PodcastPage = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' gutterBottom>
        Podcasts
      </Typography>
      <Card>
        <CardContent>
          <List>
            {podcastData.map((episode, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={episode.title}
                  secondary={`Duration: ${episode.duration}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PodcastPage;
