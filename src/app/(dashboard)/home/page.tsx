'use client';
import FacebookPagePlugin from '@/components/FacebookPageplugin';
import FacebookPosts from '@/components/FacebookPosts';
import LoadingBox from '@/components/LoadingBox';
import StoreContext from '@/context/StoreContext';
import theme from '@/theme';
import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState, useEffect, useContext } from 'react';

const Page = () => {
  const store = useContext(StoreContext);
  const [fbSdkLoaded, setFbSdkLoaded] = useState(false);
  useEffect(() => {
    // Check if the fb-root element exists and if FB is defined globally
    const fbRoot = document.getElementById('fb-root');
    console.log('fbRoot', fbRoot);
    if (fbRoot && (window as any).FB) {
      console.log('Facebook SDK already loaded.');
      // Optional: You can re-parse the page elements here if needed
      // to ensure newly added fb-post elements are initialized
      (window as any).FB.XFBML.parse();
      setFbSdkLoaded(true);
    } else {
      // Subscribe to the SDK's load event
      (window as any).fbAsyncInit = () => {
        setFbSdkLoaded(true);
        (window as any).FB.XFBML.parse(); // Parse again after SDK loads
      };
    }
  }, [store.user.isFacebookLoaded, (window as any).FB]); // Empty dependency array ensures this runs only once

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Home
      </Typography>
      {!fbSdkLoaded ? (
        <LoadingBox message='Lendo comentários...' />
      ) : (
        <Box>
          <FacebookPosts />
          <FacebookPagePlugin />
          <Box
            className='fb-comments'
            data-href='http://localhost:3000/home'
            // data-width='500'
            data-numposts='50'></Box>
        </Box>
      )}
    </Box>
  );
};

export default observer(Page);
