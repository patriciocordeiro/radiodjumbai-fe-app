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

const articleData = [
  {
    title: 'The Evolution of Radio Broadcasting',
    author: 'Jane Doe',
    date: '2024-01-15',
  },
  {
    title: 'How Podcasts Changed Media Consumption',
    author: 'John Smith',
    date: '2024-02-10',
  },
  {
    title: 'Top 5 Radio Shows to Listen to in 2024',
    author: 'Alex Johnson',
    date: '2024-03-05',
  },
  {
    title: 'The Future of Audio Content',
    author: 'Emily Davis',
    date: '2024-04-12',
  },
];

const ArticlesPage = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' gutterBottom>
        Articles
      </Typography>
      <Card>
        <CardContent>
          <List>
            {articleData.map((article, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={article.title}
                  secondary={`By ${article.author} on ${article.date}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ArticlesPage;
