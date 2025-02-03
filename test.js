// fetch(
//   'https://graph.facebook.com/v22.0/c4devbr/feed?access_token=e0afae6c2346975efa90246ba7f35014&fields=permalink_url&method=get&pretty=0&sdk=joey&suppress_http_code=1'
// )
//   .then((res) => {})
//   .catch((error) => {
//     console.log(error);
//   });

async function fetchFacebookPosts() {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/c4devbr/feed?access_token=e0afae6c2346975efa90246ba7f35014&fields=permalink_url,message,created_time,full_picture`
    );

    if (!response.ok) {
      const errorData = await response.json(); // Try to get error details
      throw new Error(
        `Facebook API error: ${response.status} - ${
          errorData?.error?.message || 'Unknown error'
        }`
      );
    }

    const data = await response.json();
    console.log('Facebook posts:', data.data);
  } catch (error) {
    console.error('Error fetching Facebook posts:', error);
  }
}

fetchFacebookPosts();
