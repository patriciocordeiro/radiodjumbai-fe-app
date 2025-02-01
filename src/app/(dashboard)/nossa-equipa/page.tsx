import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const teamData = [
  { name: 'John Doe', position: 'CEO' },
  { name: 'Jane Doe', position: 'CFO' },
  { name: 'Alice Doe', position: 'CTO' },
  { name: 'Bob Doe', position: 'COO' },
];

const TeamPage = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' gutterBottom>
        Nossa Equipa
      </Typography>
      <Card>
        <CardContent>
          <List>
            {teamData.map((member, index) => (
              <ListItem key={member.name}>
                <ListItemText
                  primary={member.name}
                  secondary={`Position: ${member.position}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeamPage;
