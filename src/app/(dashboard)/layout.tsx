'use client';
import {
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ScheduleIcon from '@mui/icons-material/Event';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import ArticleIcon from '@mui/icons-material/Article';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Link from 'next/link';
import { useState } from 'react';
import MoreOptionsDialog from './MoreOptionsDialog';
import useCompany from '@/hooks/useCompany';

const navItems = [
  { label: 'Home', icon: <HomeIcon />, link: '/home' },
  { label: 'Programação', icon: <ScheduleIcon />, link: '/programacao' },
  { label: 'Podcasts', icon: <PodcastsIcon />, link: '/podcasts' },
  { label: 'Artigos', icon: <ArticleIcon />, link: '/artigos' },
  { label: 'Mais', icon: <MoreVertIcon />, link: '/more' },
];

interface MobileRadioHomePageProps {
  readonly children: React.ReactNode;
}

export default function MobileRadioHomePage({
  children,
}: MobileRadioHomePageProps) {
  useCompany();
  const [value, setValue] = useState(0);
  const [open, setOpen] = useState(false);

  const handleMoreClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar position='sticky'>
        <Toolbar>
          <Typography variant='h6'>Radio Djumbai</Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 2 }}>{children}</Box>
      {/* Bottom Navigation */}
      <BottomNavigation
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        showLabels>
        {navItems.map((item, index) =>
          item.label === 'Mais' ? (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
              onClick={handleMoreClick}
            />
          ) : (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
              component={Link}
              href={item.link}
            />
          )
        )}
      </BottomNavigation>
      <MoreOptionsDialog open={open} onClose={handleClose} />
    </Box>
  );
}
