'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [checking, setChecking] = useState(true); // prevent flash

  useEffect(() => {
    if (token) {
      toast.info('You are already logged in');
      router.replace('/dashboard');
    } else {
      setChecking(false); // only allow rendering if not logged in
    }
  }, [token, router]);

  if (checking) {
    return null; // block render until check is done
  }

  return <>{children}</>;
}
