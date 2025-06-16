// src/app/edit/[id]/page.tsx

export const dynamic = 'force-dynamic';
import WorkoutEditor from '@/components/WorkoutEditor';
import supabase from '@/lib/supabase';
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { id } = await params;

  const { data: workout, error } = await supabase
    .from('workouts')
    .select(`
      *,
      exercises (
        *,
        sets (*)
      )
    `)
    .eq('id', id)
    .maybeSingle();

  console.log('Supabase error:', error);
  console.log('Supabase workout:', workout);

  if (error) {
    return <div>Error loading workout: {error.message}</div>;
  }

  if (!workout) {
    return <div>Workout not found</div>;
  }

  return (
    <div>
      <h1>Edit Workout: {workout.title}</h1>
      {/* Render your workout editing UI here */}
      <WorkoutEditor workout={workout} />;
    </div>
  );
}

