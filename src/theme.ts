// src/theme.ts
'use client';
import { red, teal } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,

  },
  palette: {
    // mode: 'dark',
    // text : {
    //   primary: '#fff',
    //   secondary: '#fff',
    // },
    primary: {
      main: '#CE1227',
    },

  },
  components: {
    MuiToolbar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // This disables the box-shadow globally

        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // This disables the box-shadow globally
          // textTransform: 'none',
        },

      },
    },
    // MuiPaper: {
    //   styleOverrides: {
    //     root: {
    //       boxShadow: 'none', // This disables the box-shadow globally
    //     },
    //   },
    // },
  },
});

export default theme;
