import { Box, CircularProgress, Stack, Typography } from '@mui/material';

type LoadingBoxProps = {
  message?: string;
};
const LoadingBox = ({ message }: LoadingBoxProps) => {
  return (
    <Stack
      height={200}
      direction={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      alignContent={'center'}>
      <CircularProgress />
      {message && (
        <Box padding={2}>
          <Typography variant={'body1'} color='text.secondary'>{message}</Typography>
        </Box>
      )}
    </Stack>
  );
};

export default LoadingBox;
