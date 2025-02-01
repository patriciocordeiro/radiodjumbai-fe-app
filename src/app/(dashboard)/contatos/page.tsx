'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import StoreContext from '@/context/StoreContext';

const ContactsPage = () => {
  const store = useContext(StoreContext);

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Entre em contato
      </Typography>
      <List>
        <Typography variant='body1'>Telefones:</Typography>
        {store.company.selectedItem?.phones?.map((phone, index) => (
          <ListItem key={phone + index}>
            <ListItemIcon>
              <PhoneIcon />
            </ListItemIcon>
            <ListItemText primary={phone} />
          </ListItem>
        ))}
        <ListItem>
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <a href={`mailto:${store.company.selectedItem?.email}`}>
                {store.company.selectedItem?.email}
              </a>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText
            primary={`Endereço: ${store.company.selectedItem?.address}`}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default observer(ContactsPage);
