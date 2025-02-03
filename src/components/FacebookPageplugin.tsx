'use client';
import { useEffect } from 'react';

const FacebookPagePlugin = () => {
  const url =
    'https://www.facebook.com/profile.php?id=61572178053929&mibextid=ZbWKwL';
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div
      className='fb-page'
      data-href={url}
      data-tabs='timeline'
      data-width=''
      data-height=''
      data-small-header='true'
      data-adapt-container-width='true'
      data-hide-cover='false'
      data-show-facepile='true'>
      <blockquote cite={url} className='fb-xfbml-parse-ignore'>
        <a href={url}>Facebook</a>
      </blockquote>
    </div>
  );
};

export default FacebookPagePlugin;
