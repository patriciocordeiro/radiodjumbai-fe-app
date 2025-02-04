import { Box, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import LoadingBox from './LoadingBox';
import { FacebookFeed } from '@/models/app-general.model';
import StoreContext from '@/context/StoreContext';

const accessToken =
  'EAADBGwKLsskBO4GFSGJSeJV7o0ZAAZBvVBj3LxFzBow4oNSfmal89gdEO2y58Yp6VW1cAN1MdlFLiFDl1qUiZClKLBaY6HjZBrf78fhSEBTZBb2zXZAgDZAE0mpZCvpFsvVrdmFit1ZAHYikuJBfdrzd8xmJAcbhgEx8EeBALZBJuU9VOPDyEXzQNyG0ftvWXAjeZBH';

const FacebookPosts = () => {
  const [posts, setPosts] = useState<FacebookFeed[] | null>(null);
  const [loading, setLoading] = useState(true);
  const store = useContext(StoreContext);

  useEffect(() => {
    console.log('parsed');
    const fetchPosts = async () => {
      if (window.FB) {
        try {
          const posts = await store.facebookFeed.listFeedItems(accessToken);
          console.log('posts', posts);
          setPosts(posts);
          setLoading(false);
        } catch (error) {
          console.log('error', error);
          setLoading(false);
        }
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <LoadingBox message='Lendo posts...' />;
  }

  if (!!posts && !posts?.length) {
    return <LoadingBox message='Nenhum post encontrado.' />;
  }

  return (
    <Stack direction='column' marginTop={4} marginBottom={3}>
      <Typography variant='h4' >
        Últimos posts
      </Typography>
      <Divider sx={{marginBottom: 2}} />
      <Grid container spacing={3}>
        {posts?.map((post: any) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: 0
              }}>
              <CardContent style={{ flexGrow: 1, padding:8 }}>
                {/* <Typography key={post.message} marginBottom={1} variant='h6'>
                  {post.message}
                </Typography> */}
                <div
                  key={post.id}
                  className='fb-post'
                  data-href={post.permalink_url}
                  data-width={350}
                  data-show-text='true'></div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default FacebookPosts;
