'use client';
import {
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Container,
  Menu,
  MenuItem,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ScheduleIcon from '@mui/icons-material/Event';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import ArticleIcon from '@mui/icons-material/Article';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Link from 'next/link';
import { useState } from 'react';
import useCompany from '@/hooks/useCompany';
import { AppRoutes } from '@/enums/process-status';

const navItems = [
  { label: 'Home', icon: <HomeIcon />, route: `/${AppRoutes.HOME}` },
  {
    label: 'Schedule',
    icon: <ScheduleIcon />,
    route: `/${AppRoutes.PROGRAMACAO}`,
  },
  {
    label: 'Podcasts',
    icon: <PodcastsIcon />,
    route: `/${AppRoutes.PODCASTS}`,
  },
  { label: 'Articles', icon: <ArticleIcon />, route: `/${AppRoutes.ARTIGOS}` },
  { label: 'Mais', icon: <MoreVertIcon /> },
];

const moreOptions = [
  { label: 'Sobre Radio Djumbai', link: `/${AppRoutes.ABOUT_US}` },
  { label: 'Contactos', link: `/${AppRoutes.CONTACTS}` },
  { label: 'Nossa equipa', link: `/${AppRoutes.TEAM_MEMBERS}` },
];

interface MobileRadioHomePageProps {
  readonly children: React.ReactNode;
}

export default function MobileRadioHomePage({
  children,
}: MobileRadioHomePageProps) {
  useCompany();
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
      <Container sx={{ pt: 2, pb: 3 }}>
        {children}

        <Box height={100} />
      </Container>
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
              component={item.route ? Link : 'div'}
              href={item.route ?? ''}
            />
          )
        )}
      </BottomNavigation>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {moreOptions.map((option, index) => (
          <Link key={option.link} href={option.link} passHref>
            <MenuItem onClick={handleClose}>{option.label}</MenuItem>
          </Link>
        ))}
      </Menu>
    </Box>
  );
}
