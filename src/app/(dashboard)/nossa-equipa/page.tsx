'use client';
import LoadingBox from '@/components/LoadingBox';
import StoreContext from '@/context/StoreContext';
import { ProcessStatus } from '@/enums/process-status';
import { StoreKeys } from '@/stores/base.store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { use, useContext, useEffect, useState } from 'react';

const TeamPage = () => {
  const store = useContext(StoreContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(
      store.teamMember.status[StoreKeys.ListItems] === ProcessStatus.LOADING
    );
  }, [store.teamMember.status[StoreKeys.ListItems]]);

  useEffect(() => {
    store.teamMember.listItems();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' gutterBottom>
        Nossa Equipa
      </Typography>

      {loading ? (
        <LoadingBox />
      ) : (
        <Card>
          <CardContent>
            <List>
              {store.teamMember.itemList.map((member, index) => (
                <ListItem key={member.name}>
                  <ListItemText
                    primary={member.name}
                    secondary={`Position: ${member.role}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default observer(TeamPage);
