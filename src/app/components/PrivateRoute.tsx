'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error('Please log in to continue');
      router.replace('/auth');
    } else {
      setChecking(false);
    }
  }, [token, router]);

  if (checking) {
    return null;
  }

  return <>{children}</>;
}
