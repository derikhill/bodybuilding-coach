'use client';

import supabase from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';
import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    // Subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        window.location.href = '/dashboard';
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome</h1>
      <AuthForm onLogin={() => window.location.href = '/dashboard'} />
    </div>
  );
}
