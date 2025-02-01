'use client';
import StoreContext from '@/context/StoreContext';
import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

const AboutUsPage = () => {
  const store = useContext(StoreContext);
  store.company.selectedItem!;

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        {store.company.selectedItem?.name}
      </Typography>
      <Typography variant='body1'>
        {store.company.selectedItem?.description}
      </Typography>
    </Box>
  );
};

export default observer(AboutUsPage);
