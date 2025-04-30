'use client';

import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThermometerSun } from 'lucide-react';
import Link from 'next/link';
import supabase from '@/lib/supabase';

interface Workout {
  id: string;
  title: string;
  date: string;
  created_at: string;
  notes?: string;
  workout_type: string;
  exercises: {
    id: string;
    name: string;
    is_superset: boolean;
    notes?: string;
    sets: {
      id: string;
      set_number: number;
      warmup: boolean;
      reps: number;
      weight: number;
      rir?: number;
    }[];
    order_index: number;
  }[];
}

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
      .from('workouts')
      .select(`
        id, date, created_at, workout_type, notes, title,
        exercises (
          id, name, is_superset, notes,
          sets (
            id, set_number, warmup, reps, weight, rir
          ),
          order_index
        )
      `)
      .order('date', { ascending: false })
      .order('order_index', { foreignTable: 'exercises', ascending: true });
  
      if (error) {
        console.error('Error fetching workouts:', error);
      } else {
        setWorkouts(data || []);  // Set the workouts state here
      }
    };
  
    fetchWorkouts();
  }, []);
  
  return (
    <div className="mt-10">
      <h2 className="text-4xl font-semibold mb-4 text-slate-100">Workout History</h2>
      <Accordion type="multiple" className="w-full max-w-xl justify-self-center">
        {workouts.map((workout) => (
          <AccordionItem key={workout.id} value={workout.id}>
            <AccordionTrigger>
              <div className="flex flex-col text-left">
                <span className="font-medium text-2xl text-slate-100">{workout.title}</span>
                <span className="text-sm text-gray-500">{new Date(workout.date).toISOString().split('T')[0]}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className='p-2 mb-4 bg-gray-50 border rounded'>
              {workout.exercises
                .sort((a, b) => a.order_index - b.order_index) // Sort by order_index
                .map((workoutExercise) => (
                  <div key={workoutExercise.id} className="mb-4">
                    <AccordionItem value={workoutExercise.id}>
                      <AccordionTrigger>
                        <div className="font-semibold text-lg py-2">
                          {workoutExercise.name}
                          {workoutExercise.is_superset && (
                            <span className="text-sm text-blue-500 ml-2">(Superset)</span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap">
                          <table className="border-separate border-spacing-1 w-full border border-slate-400 bg-stone-200 rounded text-slate-100">
                            <thead className='border border-gray-300 bg-gray-700'>
                              <tr>
                                <td className='border border-slate-300 text-md px-4 py-2'>Warmup?</td>
                                <td className='border border-slate-300 text-md px-4 py-2'>Weight</td>
                                <td className='border border-slate-300 text-md px-4 py-2'>Reps</td>
                                <td className='border border-slate-300 text-md px-4 py-2'>RIR</td>
                              </tr>
                            </thead>
                            <tbody className="bg-gray-800">
                              {workoutExercise.sets.map((set) => (
                                <tr key={set.id} className="bg-gray-800">
                                  <td className='border border-slate-300 text-md px-4 py-2 text-center '>
                                    {set.warmup ? (
                                      <ThermometerSun className="w-5 h-5 text-orange-500 inline" />
                                    ) : (
                                      <span className="text-gray-400">—</span> // fallback if not a warmup
                                    )}
                                  </td>
                                  <td className='border border-slate-300 text-md px-4 py-2'>{set.weight}</td>
                                  <td className='border border-slate-300 text-md px-4 py-2'>{set.reps}</td>
                                  <td className='border border-slate-300 text-md px-4 py-2'>{set.rir}</td>
                                </tr>
                              ))}
                           </tbody>
                           </table>
                        </div>
                        {workoutExercise.notes && (
                          <div className="text-sm italic text-gray-600 mt-2">
                            Notes: {workoutExercise.notes}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </div>
              ))}

              {/* <Link
                href={`/edit/${workout.id}`}
                className="inline-block px-4 py-2 bg-blue-500 rounded-lg text-slate-100"
              >
                Edit workout
              </Link> */}

              {/* <button className="px-4 py-2 bg-blue-500 rounded-lg text-slate-100">
                <Link href={`/edit/${workout.id}`}>Edit workout</Link>
              </button> */}
              {workout.notes && (
                <div className="text-sm italic text-gray-600 mt-2">Notes: {workout.notes}</div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
