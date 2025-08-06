'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
    toast.error('You must be logged in to access this page.');    
      router.push('/auth');
    }
  }, [token]);

  if (!token) return null;

  return <>{children}</>;
};

export default PrivateRoute;
