'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';

// PRIVATE
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      toast.error('You must be logged in to access this page.');
      router.push('/auth');
    }
  }, [token, isLoading]);

  if (isLoading) return null; // Optional: can show a loading spinner here

  if (!token) return null;

  return <>{children}</>;
};

export default PrivateRoute;