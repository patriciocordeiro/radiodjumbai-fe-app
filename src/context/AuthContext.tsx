'use client';
import { auth } from '@/services/firebase/firebase.config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import StoreContext from './StoreContext';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  userId?: string;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  userId: '',
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const store = useContext(StoreContext);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>('');

  const router = useRouter();
  const pathname = usePathname();

  const authContextValue = React.useMemo(
    () => ({ user, loading, userId }),
    [user, loading, userId]
  );

  const clearLocalStorageAndSetLoading = () => {
    localStorage.clear();
    setLoading(false);
  };

  const redirectToAuth = () => {
    router.replace('/auth/login');
    return;
  };

  const redirectToDashboard = () => {
    router.replace('/dashboard');
    return;
  };

  const handleAuthPath = async () => {
    const lastVisitedUrl = localStorage.getItem('lastVisitedUrl');
    if (lastVisitedUrl) {
      router.replace(lastVisitedUrl);
    } else {
      redirectToDashboard();
    }
  };

  const handleUserStateChange = async (user: User | null) => {
    setUser(user);
    localStorage.setItem('userId', user?.uid ?? '');
    store.user.setSelectedItem({
      item: {
        id: user?.uid ?? '',
        name: user?.displayName ?? '',
        avatar: user?.photoURL ?? '',
        email: '',
      },
    });

    if (user && !user?.emailVerified) {
      setLoading(false);
      auth.signOut();
      localStorage.removeItem('userId');
      if (!pathname.includes('/auth')) {
        router.replace('/auth/login');
      }
      return;
    }
    setUserId(user?.uid || '');

    if (pathname.includes('/landing')) {
      setLoading(false);
      return;
    }

    if (!user) {
      // if (pathname.includes('/auth')) {
      //   clearLocalStorageAndSetLoading();
      //   return;
      // }

      if (pathname.includes('/dashboard')) {
        localStorage.setItem('lastVisitedUrl', pathname);
        redirectToAuth();
        setLoading(false);
        return;
      }
    } else {
      // const currentUser = await store.user.getItem({
      //   id: user.uid || '',
      // });

      // if (!currentUser?.id) {
      //   clearLocalStorageAndSetLoading();
      //   auth.signOut();
      //   router.replace('../page-error');
      //   setLoading(false);
      //   return;
      // } else {
      localStorage.setItem('userId', user.uid);

      if (pathname.includes('/auth')) {
        redirectToDashboard();
        setLoading(false);

        return;
      }

      setLoading(false);
      return;
      // }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (localStorage.getItem('userId') && pathname.includes('/auth')) {
      if (!auth.currentUser?.emailVerified) {
        setLoading(false);
        // localStorage.removeItem('userId');
        return;
      }
      router.replace('/dashboard');
      setLoading(false);
      setUserId(localStorage.getItem('userId')! || '');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await handleUserStateChange(user);
    });

    return () => unsubscribe();
  }, [auth.currentUser, pathname]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
