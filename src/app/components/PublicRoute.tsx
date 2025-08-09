'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && token) {
      toast.error('You are already logged in.');
      router.push('/dashboard');
    }
  }, [token, isLoading]);

  if (isLoading) return null;
  if (token) return null;

  return <>{children}</>;
};
export default PublicRoute;
