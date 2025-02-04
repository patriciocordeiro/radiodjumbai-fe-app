'use client';
import {
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Container,
  Menu,
  MenuItem,
  useMediaQuery,
  IconButton,
  Button,
  Fab,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ScheduleIcon from '@mui/icons-material/Event';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import ArticleIcon from '@mui/icons-material/Article';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FacebookIcon from '@mui/icons-material/Facebook';
import Link from 'next/link';
import { useContext, useState } from 'react';
import useCompany from '@/hooks/useCompany';
import { AppRoutes } from '@/enums/process-status';
import { usePathname } from 'next/navigation';
import RadioPlayer from '@/components/RadioPlayer';
import Image from 'next/image';
import { styled } from '@mui/material/styles';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import StoreContext from '@/context/StoreContext';
import { observer } from 'mobx-react-lite';

const navItems = [
  { label: 'início', icon: <HomeIcon />, route: `/${AppRoutes.HOME}` },
  { label: 'Notícias', icon: <ArticleIcon />, route: `/${AppRoutes.NEWS}` },
  // {
  //   label: 'Posts',
  //   icon: <PodcastsIcon />,
  //   route: `/${AppRoutes.POSTS}`,
  // },
  {
    label: 'Podcasts',
    icon: <PodcastsIcon />,
    route: `/${AppRoutes.PODCASTS}`,
  },
  {
    label: 'Agenda',
    icon: <ScheduleIcon />,
    route: `/${AppRoutes.PROGRAMACAO}`,
  },
  { label: 'Mais', icon: <MoreVertIcon /> },
];

const moreOptions = [
  { label: 'Sobre Nós', route: `/${AppRoutes.ABOUT_US}`, icon: <HomeIcon /> },
  { label: 'Equipa', route: `/${AppRoutes.TEAM_MEMBERS}`, icon: <HomeIcon /> },
  { label: 'Contatos', route: `/${AppRoutes.CONTACTS}`, icon: <HomeIcon /> },
];

interface RootLayoutProps {
  readonly children: React.ReactNode;
}
function RootLayout({ children }: RootLayoutProps) {
  const store = useContext(StoreContext);
  useCompany();
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const pathname = usePathname();
  const phone = store.company.selectedItem?.phone;
  // remove all spaces from phone number and special characters
  const phoneLink = phone?.replace(/\s/g, '').replace(/\D/g, '');
  const facebook = 'https://www.facebook.com/profile.php?id=61572178053929';

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top App Bar */}
      {!isMobile && (
        <AppBar position='sticky'>
          <Toolbar
            sx={{
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              height: 110,
              paddingX: 2,
            }}>
            <Box
              height={90}
              width={240}
              sx={{
                display: 'flex',
                justifyContent: 'center',

                alignItems: 'center',
              }}>
              <Image src='/logo.png' alt='logo' width={310} height={310} />
            </Box>
            <Box>
              <MaskedDiv maskHeight={100}>
                <RadioPlayer />
              </MaskedDiv>
            </Box>
          </Toolbar>
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {[...navItems, ...moreOptions]
                .filter((el) => el.label !== 'Mais')
                .map((item) =>
                  item.route === `/${AppRoutes.HOME}` ? (
                    <Link
                      key={item.label}
                      href={item.route ?? ''}
                      style={{ minWidth: 120 }}>
                      <IconButton sx={{ color: 'white' }}>
                        {item.icon}
                      </IconButton>
                    </Link>
                  ) : (
                    <Link key={item.label} href={item.route ?? ''}>
                      <Button
                        color='inherit'
                        sx={{
                          minWidth: 120,
                          borderRadius: 0,
                          height: '100%',
                          borderBottomWidth: 2,
                          borderBottomStyle: 'solid',
                          borderBottomColor:
                            pathname === item.route ? 'white' : 'transparent',
                        }}>
                        {item.label}
                      </Button>
                    </Link>
                  )
                )}
            </Box>
            <IconButton
              color='inherit'
              component='a'
              href={facebook}
              target='_blank'
              rel='noopener noreferrer'>
              <FacebookIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Main Content */}
      <Container sx={{ pt: 2, pb: 3 }}>
        {children}
        <Box height={100} />
      </Container>

      {/* Bottom Navigation */}
      {isMobile && (
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
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {moreOptions.map((option, index) => (
          <Link key={option.route} href={option.route} passHref>
            <MenuItem onClick={handleClose}>{option.label}</MenuItem>
          </Link>
        ))}
      </Menu>
      {/* WhatsApp FAB */}
      <Fab
        style={{ backgroundColor: '#25d366' }}
        aria-label='whatsapp'
        href={`https://wa.me/${phoneLink}`}
        target='_blank'
        rel='noopener noreferrer'
        sx={{ position: 'fixed', bottom: 16, right: 16, color: 'white',  }}>
        <WhatsAppIcon style={{fontSize: 36}} />
      </Fab>
    </Box>
  );
}

export default observer(RootLayout);

const MaskedDiv = styled('div')<{ maskHeight: number }>`
  position: relative;
  width: 100%;
  height: ${({ maskHeight }) => maskHeight}px; // Your component's height
  overflow: hidden; // Hide anything that extends beyond the mask

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      white,
      // Or your background color
      white 70%,
      // Adjust the percentage for the mask height
      transparent 70% // Transition to transparent at the desired point
    );
  }

  //Apply styles to the content of the MaskedDiv as needed
  > * {
    position: relative; //Important so the content does not get covered by the ::before mask
  }
`;
