'use client';
import { useState } from 'react';
import supabase from '@/lib/supabase';

export default function AddWorkoutForm() {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const user = supabase.auth.user();
    if (!user) {
      setError('You must be logged in to log workouts');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('workouts')
      .insert([
        {
          user_id: user.id,
          exercise,
          sets,
          reps,
          weight,
          notes,
        },
      ]);

    if (error) {
      setError(error.message);
    } else {
      setExercise('');
      setSets(0);
      setReps(0);
      setWeight(0);
      setNotes('');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Exercise"
        className="w-full p-2 border rounded"
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Sets"
        className="w-full p-2 border rounded"
        value={sets}
        onChange={(e) => setSets(Number(e.target.value))}
        required
      />
      <input
        type="number"
        placeholder="Reps"
        className="w-full p-2 border rounded"
        value={reps}
        onChange={(e) => setReps(Number(e.target.value))}
        required
      />
      <input
        type="number"
        placeholder="Weight (optional)"
        className="w-full p-2 border rounded"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
      />
      <textarea
        placeholder="Notes (optional)"
        className="w-full p-2 border rounded"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      ></textarea>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        disabled={loading}
      >
        {loading ? 'Logging workout...' : 'Log Workout'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
