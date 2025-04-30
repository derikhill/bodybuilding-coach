import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuickAddRoutine({userId, goBack }: { userId: string }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRoutines() {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          id, title, workout_type, notes,
          routine_exercises (
            id, name, order_index, is_superset, notes,
            routine_sets (
              id, set_number, warmup, reps, weight, rir
            ),
            order_index
          )
        `)
        .eq('user_id', userId)
        .order('title')
        .order('order_index', { foreignTable: 'routine_exercises', ascending: true });

      if (error) setError(error);
      else setRoutines(data);

      setLoading(false);
    }

    fetchRoutines();
  }, []);

  const handleQuickAdd = async (routineId) => {
    // This would normally trigger a backend call to create a new workout from the routine
    const { error } = await supabase.rpc('log_routine', { p_routine_id: routineId });
    if (error) {
      console.error('Failed to log routine:', error);
      alert('Could not log this routine');
    } else {
      alert('Routine logged successfully!');
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading routines: {error.message}</div>;
  }

  return (
    <div className="p-4 grid gap-4">
      <div>
      <button onClick={goBack} className="text-sm text-blue-400 hover:underline mb-4">
        ← Back to Dashboard
      </button>
      {/* rest of the form */}
    </div>
      {routines.map((routine) => (      
        <Card key={routine.id} className="hover:shadow-lg transition-all">
          <CardContent className="flex justify-between items-center p-4">
            <div>
            <Accordion type="multiple" className="w-full max-w-xl justify-self-center">
              <AccordionItem value={routine.id}>
                <AccordionTrigger>
                  <h2 className="text-lg font-bold">{routine.title}</h2>
                  {/* <p className="text-sm text-muted-foreground">Routine ID: {routine.id}</p> */}
                </AccordionTrigger>
                <AccordionContent>
                  {routine.routine_exercises.map((exercise) => (
                    <div key={exercise.id} className="mb-2">
                      <div className="font-semibold">{exercise.name}</div>
                      {exercise.notes && (
                        <div className="text-sm text-gray-600">{exercise.notes}</div>
                      )}
                      <div className="text-sm">
                        {exercise.routine_sets.map((set) => (
                          <div key={set.id} className="ml-4">
                            Set {set.set_number}: {set.reps} reps @ {set.weight} lbs
                            {set.rir && <span> (RIR: {set.rir})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            </div>
            <Button onClick={() => handleQuickAdd(routine.id)}>Quick Add</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
