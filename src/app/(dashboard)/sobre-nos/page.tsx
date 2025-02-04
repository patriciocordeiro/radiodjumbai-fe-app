'use client';
import StoreContext from '@/context/StoreContext';
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

const AboutUsPage = () => {
  const store = useContext(StoreContext);

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Sobre {store.company.selectedItem?.name}
      </Typography>
      <Divider />
      <Box sx={{ mt: 2 }}>
        <Card sx={{ height: '100%' }} elevation={0}>
          <CardContent>
            <Typography
              variant='body1'
              sx={{ lineHeight: ' 28px', textAlign: 'justify' }}>
              {store.company.selectedItem?.description}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default observer(AboutUsPage);
