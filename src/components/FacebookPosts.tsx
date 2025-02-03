import { Box, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import LoadingBox from './LoadingBox';

interface FacebookFeedItem {
  id: string;
  permalink_url: string;
  message?: string;
  attachments?: {
    data: {
      description?: string;
      title?: string;
    }[];
  };
  story?: string; // Add this if you're also requesting the 'story' field
  created_time?: string; // Add this if you're requesting the created_time
  full_picture?: string; // Add this if you're requesting full_picture
  // ... any other fields you are requesting
}

const accessToken =
  'EAADBGwKLsskBO4GFSGJSeJV7o0ZAAZBvVBj3LxFzBow4oNSfmal89gdEO2y58Yp6VW1cAN1MdlFLiFDl1qUiZClKLBaY6HjZBrf78fhSEBTZBb2zXZAgDZAE0mpZCvpFsvVrdmFit1ZAHYikuJBfdrzd8xmJAcbhgEx8EeBALZBJuU9VOPDyEXzQNyG0ftvWXAjeZBH';

const FacebookPosts = () => {
  const [posts, setPosts] = useState<FacebookFeedItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('parsed');
    const fetchPosts = async () => {
      if (window.FB) {
        try {
          window.FB.api(
            `/c4devbr/feed?access_token=${accessToken}&fields=permalink_url,attachments{description,title},message`,
            function (response: any) {
              if (response && !response.error) {
                /* handle the result */

                setPosts(response.data);
              }
              setLoading(false);
              setTimeout(() => {
                (window as any).FB.XFBML.parse();
              }, 1000);
            }
          );
        } catch (err) {
          console.log('err', err);
        } finally {
          setPosts([]);
          setLoading(false);
        }
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <LoadingBox message='Lendo comentários...' />;
  }

  if (!!posts && !posts?.length) {
    return <LoadingBox message='Nenhum comentário encontrado.' />;
  }
  console.log('posts', posts);

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget;
    console.log('iframe', iframe);
    iframe.style.height =
      iframe.contentWindow?.document.body.scrollHeight + 'px';
  };

  return (
    <Stack direction='column' spacing={2}>
      <Typography variant='h4' gutterBottom>
        Últimos posts
      </Typography>
      <Stack direction='column' spacing={3} maxWidth={'750px'}>
        {posts?.map((post: any) => (
          <Box key={post.id}>
            <Typography key={post.message} marginBottom={1} variant='h6'>
              {post.message}
            </Typography>
            <div
              key={post.id}
              className='fb-post'
              data-href={post.permalink_url}
              data-width='750'
              data-show-text='true'></div>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};

export default FacebookPosts;
