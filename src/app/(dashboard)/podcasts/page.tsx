'use client';
import * as React from 'react';

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Link,
  CardActionArea,
  Divider,
} from '@mui/material';
import StoreContext from '@/context/StoreContext';
import { useEffect } from 'react';
import { StoreKeys } from '@/stores/base.store';
import { AppRoutes, ProcessStatus } from '@/enums/process-status';
import LoadingBox from '@/components/LoadingBox';
import { Podcast } from '@/models/app-general.model';
import { observer } from 'mobx-react-lite';

interface PodcastCardProps {
  podcast: Podcast;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea>
        <Link href={`/${AppRoutes.PODCASTS}/${podcast?.id}`}>
          <CardMedia
            component='img'
            height='140'
            image={podcast?.imageUrl}
            alt={podcast?.title}
          />
          <CardContent>
            <Typography gutterBottom variant='h5' component='div'>
              {podcast?.title}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {podcast?.author}
            </Typography>
            <Link href={`/${AppRoutes.PODCASTS}/${podcast?.id}`}>
              Ver episódios
            </Link>
          </CardContent>
        </Link>
      </CardActionArea>
    </Card>
  );
};

const PodcastListPage: React.FC = () => {
  const store = React.useContext(StoreContext);
  const [podcasts, setPodcasts] = React.useState(store.podcast.itemList);
  const [loading, setLoading] = React.useState<boolean>(true);

  useEffect(() => {
    store.podcast.listItems();
  }, []);

  useEffect(() => {
    setLoading(
      store.podcast.status[StoreKeys.ListItems] === ProcessStatus.LOADING
    );
  }, [store.podcast.status[StoreKeys.ListItems]]);

  useEffect(() => {
    setPodcasts(store.podcast.itemList);
  }, [store.podcast.selectedItem]);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant='h4' gutterBottom>
        Podcasts
      </Typography>
      <Divider />

      {loading ? (
        <LoadingBox />
      ) : (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {podcasts.map((podcast) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={podcast.id}>
                <PodcastCard podcast={podcast} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default observer(PodcastListPage);
