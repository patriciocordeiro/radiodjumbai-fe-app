'use client';
import FacebookPagePlugin from '@/components/FacebookPageplugin';
import FacebookPosts from '@/components/FacebookPosts';
import LoadingBox from '@/components/LoadingBox';
import RadioPlayer from '@/components/RadioPlayer';
import StoreContext from '@/context/StoreContext';
import { AppRoutes } from '@/enums/process-status';
import theme from '@/theme';
import { Box, Divider, Typography, useMediaQuery } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState, useEffect, useContext } from 'react';
import { setTimeout } from 'timers';

const Page = () => {
  const store = useContext(StoreContext);
  const [fbSdkLoaded, setFbSdkLoaded] = useState(false);
  const isSmallMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  console.log('isSmallMediumScreen', isSmallMediumScreen);
  useEffect(() => {
    // Check if the fb-root element exists and if FB is defined globally
    if (window !== undefined) {
      const fbRoot = document.getElementById('fb-root');
      if (fbRoot && (window as any).FB) {
        console.log('Facebook SDK already loaded.');
        setFbSdkLoaded(true);

        // Optional: You can re-parse the page elements here if needed
        // to ensure newly added fb-post elements are initialized
        setTimeout(() => {
          (window as any).FB.XFBML.parse();
        }, 1000);
      } else {
        // Subscribe to the SDK's load event
        (window as any).fbAsyncInit = () => {
          setFbSdkLoaded(true);
          (window as any).FB.XFBML.parse(); // Parse again after SDK loads
        };
      }
    }
  }, [store.user.isFacebookLoaded]); // Empty dependency array ensures this runs only once

  return (
    <Box>
      {!fbSdkLoaded ? (
        <LoadingBox message='Lendo comentários...' />
      ) : (
        <>
          <Box
            sx={{
              height: 500,
              left: '0%',
              right: '0%',
              // toolbar height from theme
              top: theme.spacing(8),
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.palette.primary.main,
            }}>
            {/* <Box width={'100%'} maxWidth={'50%'}>
              <RadioPlayer />
            </Box> */}
          </Box>

          <FacebookPosts />
          {/* <FacebookPagePlugin /> */}
          <Typography variant='h4' sx={{ marginTop: 4 }}>
            Comentários
          </Typography>
          <Divider />
          <Box marginTop={2}>
            <div
              className='fb-comments'
              data-href={window.location.href}
              // data-width='500'
              data-numposts='50'></div>
          </Box>
        </>
      )}
    </Box>
  );
};

export default observer(Page);
