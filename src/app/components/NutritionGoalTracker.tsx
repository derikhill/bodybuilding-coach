'use client';

import { useEffect, useState } from 'react';
import { getNutritionLogsLast7Days } from '@/lib/getNutritionLogs'; // adjust path
// import { useUser } from '@supabase/auth-helpers-react'; // assuming you use this for auth
import supabase from '@/lib/supabase';

const GOALS = {
  calories: 2600,
  protein: 220,
  carbs: 320,
  fat: 70,
};

export default function NutritionGoalTracker({userId}: { userId: string }) {
  // const user = useUser();
  const [averages, setAverages] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function fetchData() {
      // if (!user) return;
      const logs = await getNutritionLogsLast7Days(userId);

      if (logs.length === 0) return;

      const totals = logs.reduce(
        (acc: any, log: any) => {
          acc.calories += log.calories || 0;
          acc.protein += log.protein || 0;
          acc.carbs += log.carbs || 0;
          acc.fat += log.fat || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const avg = {
        calories: totals.calories / logs.length,
        protein: totals.protein / logs.length,
        carbs: totals.carbs / logs.length,
        fat: totals.fat / logs.length,
      };

      setAverages(avg);
    }

    fetchData();
  }, [userId]);

  if (!userId) return null;
  if (!averages.calories) return <p>Loading goal tracker...</p>;

  function getStatus(average: number, goal: number) {
    const percent = (average / goal) * 100;
    if (percent >= 90) return '✅';
    if (percent >= 80) return '⚠️';
    return '❌';
  }

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-md space-y-2 max-w-xl mx-auto mt-8 mb-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Nutrition Goal Tracker (7-Day Avg)</h2>
      {Object.keys(GOALS).map((key) => (
        <div key={key} className="space-y-1">
        <div className="flex justify-between text-slate-200 text-sm">
          <span className="capitalize">{key}</span>
          <span>
            {averages[key]?.toFixed(0)} / {GOALS[key]} {getStatus(averages[key], GOALS[key])}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full ${
            (averages[key] / GOALS[key]) > 1.2
              ? 'bg-purple-600' // Way over goal
              : (averages[key] / GOALS[key]) >= 0.9
              ? 'bg-green-500' // On point
              : (averages[key] / GOALS[key]) >= 0.8
              ? 'bg-yellow-400' // Close
              : 'bg-red-500'    // Too low
          }`}
          style={{
            width: `${Math.min((averages[key] / GOALS[key]) * 100, 100)}%`,
            transition: 'width 0.3s ease-in-out',
          }}
        />
        </div>
      </div>
      
      ))}
    </div>
  );
}
