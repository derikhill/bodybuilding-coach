'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import WorkoutForm from '@/components/WorkoutForm';
import WorkoutHistory from '@/components/WorkoutHistory';
import TabsNav from '@/components/TabsNav';
import DesktopTabs from '@/components/DesktopTabs';
import TabContent from '@/components/TabContent';
import QuickAdd from '@/components/QuickAdd';
import NutritionDashboard from '@/components/NutritionDashboard';
import NutritionLogForm from '@/components/NutritionLogForm';
import NutritionGoalTracker from '@/components/NutritionGoalTracker';
// import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'nutrition-history'>('log');
  const [logMode, setLogMode] = useState<'form' | 'quick' | 'add-food' | null>(null);

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/');
        return;
      }

      setUser(userData.user);
      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="p-8 pb-16 bg-stone-800 min-h-screen">
      <h1 className="text-2xl text-slate-100 font-bold mb-4">Welcome, {user!.email}</h1>

      {/* Desktop Tabs */}
      <DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="min-h-[500px] place-content-center">
        {/* <motion.div layout="position" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}> */}
          <TabContent tabKey="log" activeTab={activeTab}>
            {logMode === null && (
              <div className="grid place-content-center gap-6 space-x-12">
                <button
                  onClick={() => setLogMode('form')}
                  className="w-full max-w-md p-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                >
                  Log Workout
                </button>
                <button
                  onClick={() => setLogMode('quick')}
                  className="w-full max-w-md p-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                >
                  Quick Add
                </button>
                <button
                  onClick={() => setLogMode('add-food')}
                  className="w-full max-w-md p-4 bg-slate-400 text-white rounded-lg shadow hover:bg-slate-500"
                >
                  Add Nutrition
                </button>
              </div>
            )}

            {logMode === 'form' && (
              <WorkoutForm userId={user!.id} onNewWorkout={() => {}} goBack={() => setLogMode(null)} />
            )}

            {logMode === 'quick' && (
              <QuickAdd userId={user!.id} goBack={() => setLogMode(null)} />
            )}

            {logMode === 'add-food' && (
              <NutritionLogForm userId={user!.id} goBack={() => setLogMode(null)} />
            )}
          </TabContent>
          <TabContent tabKey="history" activeTab={activeTab}>
            <WorkoutHistory />
          </TabContent>
          <TabContent tabKey="nutrition-history" activeTab={activeTab}>
            <NutritionGoalTracker userId={user!.id}/>
            <NutritionDashboard userId={user!.id} />
          </TabContent>
        {/* </motion.div> */}
      </div>

      {/* Mobile Tab Nav */}
      <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
