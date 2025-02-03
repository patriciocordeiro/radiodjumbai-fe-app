'use client';

import StoreContext, { StoreProvider } from '@/context/StoreContext';
import theme from '@/theme';
import { ThemeProvider } from '@emotion/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { useContext, useEffect } from 'react';

const Main = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const store = useContext(StoreContext);

  useEffect(() => {
    (window as any).fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          // FB is now recognized
          appId: '212321750987465',
          xfbml: true,
          version: 'v22.0', // or latest
        });
        (window as any).FB.AppEvents.logPageView();
        store.user.setFacebookLoaded();

        console.log('Facebook SDK loaded properly.');
      } else {
        console.error('Facebook SDK not loaded properly.');
      }
    };
  }, []);

  return (
    <AppRouterCacheProvider>
      {/* <DndProvider backend={HTML5Backend}> */}
      <StoreProvider>
        {/* <AuthProvider> */}
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
        {/* </AuthProvider> */}
      </StoreProvider>
      {/* </DndProvider> */}
    </AppRouterCacheProvider>
  );
};

export default Main;
