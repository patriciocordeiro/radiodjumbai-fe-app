'use client';
import { Box, Typography, Avatar, Container } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import StoreContext from '@/context/StoreContext';
import { observer } from 'mobx-react-lite';
import { useParams } from 'next/navigation';
import LoadingBox from '@/components/LoadingBox';
import { ProcessStatus } from '@/enums/process-status';
import { StoreKeys } from '@/stores/base.store';

const TeamMemberPage = () => {
  const store = useContext(StoreContext);
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(store.teamMember.selectedItem!);

  useEffect(() => {
    setLoading(
      store.teamMember.status[StoreKeys.GetItem] === ProcessStatus.LOADING
    );
  }, [store.teamMember.status[StoreKeys.GetItem]]);

  useEffect(() => {
    if (id) {
      store.teamMember.getItem({ id });
    }
  }, [id]);

  useEffect(() => {
    setMember(store.teamMember.selectedItem!);
  }, [store.teamMember.selectedItem]);

  if (loading) {
    return <LoadingBox />;
  }

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 4,
        }}>
        <Avatar
          alt={member.name}
          src={member.image}
          sx={{ width: 150, height: 150, mb: 2 }}
        />
        <Typography variant='h4'>{member.name}</Typography>
        <Typography variant='h6' color='textSecondary'>
          {member.role}
        </Typography>
        <Typography variant='body1' sx={{ mt: 2, textAlign: 'center' }}>
          {member.description}
        </Typography>
      </Box>
    </Container>
  );
};

export default observer(TeamMemberPage);
