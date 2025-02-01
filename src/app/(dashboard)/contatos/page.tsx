'use client';

import {
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import StoreContext from '@/context/StoreContext';
import { LocationOn } from '@mui/icons-material';
import { ProcessStatus } from '@/enums/process-status';
import { StoreKeys } from '@/stores/base.store';
import LoadingBox from '@/components/LoadingBox';

const ContactsPage = () => {
  const store = useContext(StoreContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(
      store.company.status[StoreKeys.ListItems] === ProcessStatus.LOADING
    );
  }, [store.company.status[StoreKeys.ListItems]]);

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Entre em contato
      </Typography>
      {loading ? (
        <LoadingBox />
      ) : (
        <List>
          <ListItem>
            <ListItemIcon>
              <PhoneIcon />
            </ListItemIcon>
            <ListItemText
              aria-label='phone'
              primary='Telefone:'
              secondary={store.company.selectedItem?.phone}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText
              primary='Email:'
              secondary={
                <a href={`mailto:${store.company.selectedItem?.email}`}>
                  {store.company.selectedItem?.email}
                </a>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocationOn />
            </ListItemIcon>
            <ListItemText
              primary='Endereço:'
              secondary={store.company.selectedItem?.address}
            />
          </ListItem>
        </List>
      )}
    </Box>
  );
};

export default observer(ContactsPage);
