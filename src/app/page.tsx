'use client';
import { useRouter } from 'next/navigation';

const RootPage = () => {
  const router = useRouter();
  // redirect to the first page
  return router.push('/home');
};

export default RootPage;
