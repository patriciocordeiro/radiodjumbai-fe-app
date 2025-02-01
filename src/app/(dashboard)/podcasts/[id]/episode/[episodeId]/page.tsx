'use client';
import * as React from 'react';

import { Typography, Box, Divider } from '@mui/material';
import { useParams } from 'next/navigation';
import { FC, useEffect } from 'react';
import StoreContext from '@/context/StoreContext';

const AudioPlayerPage: FC = () => {
  const { episodeId } = useParams() as { episodeId: string };
  const store = React.useContext(StoreContext);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!episodeId) return;
    store.episode.getItem({ id: episodeId });
  }, [episodeId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = store.episode.selectedItem?.contentUrl!;
    }
  }, [store.episode.selectedItem?.contentUrl]);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant='h4'>{store.episode.selectedItem?.title}</Typography>
      <Divider />
      <Typography marginTop={2} variant='body1'>
        {store.episode.selectedItem?.description}
      </Typography>
      <Box marginTop={2}>
        <audio style={{ width: '100%' }} ref={audioRef} preload='auto' controls>
          <track kind='captions' />
        </audio>
      </Box>
    </Box>
  );
};

export default AudioPlayerPage;
