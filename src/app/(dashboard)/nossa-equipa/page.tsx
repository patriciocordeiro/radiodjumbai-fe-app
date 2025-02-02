'use client';
import LoadingBox from '@/components/LoadingBox';
import StoreContext from '@/context/StoreContext';
import { AppRoutes, ProcessStatus } from '@/enums/process-status';
import { StoreKeys } from '@/stores/base.store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Avatar,
  Grid,
  CardActionArea,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { Action } from 'rxjs/internal/scheduler/Action';

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
    <Box>
      <Typography variant='h4' gutterBottom>
        Nossa Equipa
      </Typography>
      <Divider />
      {loading ? (
        <LoadingBox />
      ) : (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {store.teamMember.itemList.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={member.name}>
                <Card>
                  <CardActionArea>
                    <Link
                      href={`/${AppRoutes.TEAM_MEMBERS}/${member.id}`}
                      onClick={() => {
                        store.teamMember.setSelectedItem({ item: member });
                      }}>
                      <CardMedia
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          pt: 2,
                        }}>
                        <Avatar
                          alt={member.name}
                          src={member.image}
                          sx={{ width: 100, height: 100 }}
                        />
                      </CardMedia>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant='h6'>{member.name}</Typography>
                        <Typography variant='body2' color='textSecondary'>
                          {member.role}
                        </Typography>
                      </CardContent>
                    </Link>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default observer(TeamPage);
