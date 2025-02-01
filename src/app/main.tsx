'use client';

import { StoreProvider } from '@/context/StoreContext';
import theme from '@/theme';
import { ThemeProvider } from '@emotion/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

const Main = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
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
