'use client';

import { useEffect, useState } from 'react';
import { getNutritionLogsLast7Days } from '@/lib/getNutritionLogs'; // adjust path
// import { useUser } from '@supabase/auth-helpers-react'; // assuming you use this for auth
// import supabase from '@/lib/supabase';

interface NutritionLog {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

const GOALS = {
  calories: 2100,
  protein: 250,
  carbs: 180,
  fat: 50,
};

type NutritionKey = keyof typeof GOALS;

export default function NutritionGoalTracker({userId}: { userId: string }) {
  // const user = useUser();
  const [averages, setAverages] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function fetchData() {
      // if (!user) return;
      const logs = await getNutritionLogsLast7Days(userId);

      if (logs.length === 0) return;

      const totals = logs.reduce(
        (acc: { calories: number; protein: number; carbs: number; fat: number }, log: NutritionLog) => {
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
    if (percent >= 90 || percent <= 110) return '✅';
    if (percent >= 80 || percent <= 120) return '⚠️';
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
            {averages[key as NutritionKey]?.toFixed(0)} / {GOALS[key as NutritionKey]} {getStatus(averages[key as NutritionKey], GOALS[key as NutritionKey])}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full ${
            (averages[key as NutritionKey] / GOALS[key as NutritionKey]) > 1.2
              ? 'bg-purple-600' // Way over goal
              : (averages[key as NutritionKey] / GOALS[key as NutritionKey]) >= 0.9
              ? 'bg-green-500' // On point
              : (averages[key as NutritionKey] / GOALS[key as NutritionKey]) >= 0.8
              ? 'bg-yellow-400' // Close
              : 'bg-red-500'    // Too low
          }`}
          style={{
            width: `${Math.min((averages[key as NutritionKey] / GOALS[key as NutritionKey]) * 100, 100)}%`,
            transition: 'width 0.3s ease-in-out',
          }}
        />
        </div>
      </div>
      
      ))}
    </div>
  );
}
