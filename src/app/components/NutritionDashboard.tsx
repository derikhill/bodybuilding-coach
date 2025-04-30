'use client';

import { useEffect, useState } from 'react';
import { eachDayOfInterval, format, startOfMonth, endOfMonth, isSameDay, isBefore, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import supabase from '@/lib/supabase';

interface NutritionLog {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

export default function NutritionDashboard() {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [selectedLog, setSelectedLog] = useState<NutritionLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const now = new Date();
    const days = eachDayOfInterval({
      start: startOfMonth(now),
      end: endOfMonth(now),
    });
    setCalendarDays(days);
  }, []);

  useEffect(() => {
    async function fetchLogs() {
      const startDate = format(startOfMonth(new Date(selectedYear, selectedMonth)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(selectedYear, selectedMonth)), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setLogs(data || []);
      }
      setLoading(false);
    }

    setLoading(true);
    fetchLogs();
  }, [selectedMonth, selectedYear]);

  if (loading) return <div className="text-center text-slate-100">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error loading nutrition logs.</div>;

  // Calculate averages
  const averages = logs.reduce(
    (acc, log) => {
      acc.calories += log.calories ? Number(log.calories) : 0;
      acc.protein += log.protein ? Number(log.protein) : 0;
      acc.carbs += log.carbs ? Number(log.carbs) : 0;
      acc.fat += log.fat ? Number(log.fat) : 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const getNutritionForDate = (dateStr: string) => {
    return logs.find((log) => log.date === dateStr);
  };

  const count = logs.length || 1;
  const avgCalories = Math.round(averages.calories / count);
  const avgProtein = Math.round(averages.protein / count);
  const avgCarbs = Math.round(averages.carbs / count);
  const avgFat = Math.round(averages.fat / count);

  const handleCardClick = (date: Date) => {
    const isoDate = format(date, "yyyy-MM-dd");
    const nutrition = getNutritionForDate(isoDate);
    if (nutrition) {
      setSelectedLog(nutrition);
      setIsModalOpen(true);
    }
  };

  const filteredDates = eachDayOfInterval({
    start: startOfMonth(new Date(selectedYear, selectedMonth)),
    end: endOfMonth(new Date(selectedYear, selectedMonth)),
  });
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(e.target.value));
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };
  
  // Helper to calculate streak
  const getLoggingStreak = (entries: { date: string }[]) => {
    const dates = entries
      .map((entry) => parseISO(entry.date))
      .sort((a, b) => b.getTime() - a.getTime());
  
    let streak = 0;
    const current = new Date();
  
    for (let i = 0; i < dates.length; i++) {
      if (isSameDay(dates[i], current)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else if (isBefore(dates[i], current)) {
        break;
      }
    }
  
    return streak;
  };
  
  const streak = getLoggingStreak(logs);  

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Averages Section */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-md text-center text-slate-100">
        <h2 className="text-2xl font-bold mb-4">Nutrition Averages</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-lg font-semibold">Calories</div>
            <div>{avgCalories}</div>
          </div>
          <div>
            <div className="text-lg font-semibold">Protein</div>
            <div>{avgProtein}g</div>
          </div>
          <div>
            <div className="text-lg font-semibold">Carbs</div>
            <div>{avgCarbs}g</div>
          </div>
          <div>
            <div className="text-lg font-semibold">Fat</div>
            <div>{avgFat}g</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">

      {/* Month & Year Select */}
      <div className="flex gap-2">
        <select value={selectedMonth} onChange={handleMonthChange} className="p-2 bg-white rounded">
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select value={selectedYear} onChange={handleYearChange} className="p-2 bg-white rounded">
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
        </div>

        {/* Logging Streak */}
        <div className="text-right text-sm text-slate-200">
          <p className="font-semibold">🔥 Streak: {streak} day{streak !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {filteredDates.map((date) => {
          const isoDate = format(date, "yyyy-MM-dd");
          const nutrition = getNutritionForDate(isoDate);

          return (
            <Card 
              key={isoDate} 
              className={`p-2 text-xs cursor-pointer transition-all hover:scale-105 ${
                nutrition ? "bg-green-100" : "bg-gray-100"
              }`}
              onClick={() => handleCardClick(date)}
            >
              <div className="font-bold mb-1">{format(date, "MMM d")}</div>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Nutrition Log for {selectedLog && format(new Date(selectedLog.date), "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Calories</div>
                  <div className="text-2xl font-bold">{selectedLog.calories}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Protein</div>
                  <div className="text-2xl font-bold">{selectedLog.protein}g</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Carbs</div>
                  <div className="text-2xl font-bold">{selectedLog.carbs}g</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Fat</div>
                  <div className="text-2xl font-bold">{selectedLog.fat}g</div>
                </div>
              </div>
              {selectedLog.notes && (
                <div className="pt-4">
                  <div className="text-sm font-medium mb-2">Notes</div>
                  <div className="text-sm text-gray-600">{selectedLog.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
