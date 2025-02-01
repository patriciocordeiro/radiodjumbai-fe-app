'use client';
import * as React from 'react';

import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { useParams } from 'next/navigation';
import StoreContext from '@/context/StoreContext';
import { useEffect } from 'react';
import { Filter } from '@/services/firebase/firebase-firestore.service';
import { PlayCircle } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { AppRoutes, ProcessStatus } from '@/enums/process-status';
import { StoreKeys } from '@/stores/base.store';
import LoadingBox from '@/components/LoadingBox';
import Link from 'next/link';

const PodcastEpisodesPage: React.FC = () => {
  const store = React.useContext(StoreContext);
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = React.useState<boolean>(true);

  useEffect(() => {
    setLoading(
      store.podcast.status[StoreKeys.GetItem] === ProcessStatus.LOADING ||
        store.episode.status[StoreKeys.ListItems] === ProcessStatus.LOADING
    );
  }, [
    store.podcast.status[StoreKeys.GetItem],
    store.episode.status[StoreKeys.ListItems],
  ]);

  useEffect(() => {
    if (!id) return;
    store.podcast.getItem({ id });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const filters: Filter[] = [
      {
        field: 'podcastId',
        operator: '==',
        value: id,
      },
    ];

    store.episode.listItems({ filters });
  }, [id]);

  return loading ? (
    <LoadingBox />
  ) : (
    <Box sx={{ padding: 2 }}>
      <Typography variant='h3' gutterBottom>
        {store.podcast.selectedItem?.title}
      </Typography>
      <Divider />
      <Box marginTop={2}>
        <Typography variant='h4' gutterBottom component='div'>
          Episódios
        </Typography>
        <List>
          {store.episode.itemList.map((episode) => (
            <Link
              onClick={() => store.episode.setSelectedItem({ item: episode })}
              href={`/${AppRoutes.PODCASTS}/${episode.podcastId}/episode/${episode?.id}`}
              key={episode.id}>
              <ListItem divider>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PlayCircle />
                </ListItemIcon>
                <ListItemText
                  primary={episode.title}
                  secondary={episode.description}
                />
              </ListItem>
            </Link>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default observer(PodcastEpisodesPage);
