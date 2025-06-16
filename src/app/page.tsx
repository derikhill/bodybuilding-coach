'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // On mount, get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bodybuilding Coach</h1>

      {!user ? (
        <AuthForm onLogin={() => supabase.auth.getUser().then(({ data }) => setUser(data.user))} />
      ) : (
        <div>
          <p className="mb-4">Logged in as: {user.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </main>
  );
}
