'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
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

type SetField = 'reps' | 'weight' | 'rir' | 'warmup';

export default function WorkoutEditor({ workout }: { workout: Workout }) {
  const [title, setTitle] = useState(workout.title);
  const [date, setDate] = useState(workout.date);
  const [exercises, setExercises] = useState(workout.exercises || []);

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: SetField, value: number | boolean) => {
    const updatedExercises = [...exercises];
    const set = updatedExercises[exerciseIndex].sets[setIndex];
    if (field === 'warmup') {
      set.warmup = value as boolean;
    } else {
      set[field] = value as number;
    }
    setExercises(updatedExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({
      id: uuidv4(),
      set_number: updatedExercises[exerciseIndex].sets.length + 1,
      reps: 0,
      weight: 0,
      rir: 0,
      warmup: false
    });
    setExercises(updatedExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updatedExercises);
  };
  
  const handleDeleteExercise = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(exerciseIndex, 1);
    setExercises(updatedExercises);
  };
  
  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        id: uuidv4(),
        name: '',
        notes: '',
        is_superset: false,
        sets: [
          {
            id: uuidv4(),
            set_number: 1,
            reps: 0,
            weight: 0,
            rir: 0,
            warmup: false,
          },
        ],
        order_index: exercises.length,
      },
    ]);
  };

  const handleSave = async () => {
    const { error: workoutError } = await supabase
      .from('workouts')
      .update({ title, date })
      .eq('id', workout.id);

    if (workoutError) {
      alert('Failed to update workout: ' + workoutError.message);
      return;
    }
  
    const exerciseUpdates = exercises.map(async (exercise) => {
      const { id: exerciseId, name, notes, sets } = exercise;
  
      await supabase.from('exercises').update({ name, notes }).eq('id', exerciseId);
  
      return Promise.all(
        sets.map(({ id, reps, weight, rir, warmup }) =>
          supabase.from('sets').update({ reps, weight, rir, warmup }).eq('id', id)
        )
      );
    });
  
    await Promise.all(exerciseUpdates);
  
    alert('Workout updated!');
  };  

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold">Title</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-semibold">Date</label>
        <input
          type="date"
          className="border rounded p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {exercises.map((exercise, i) => (
        <div key={exercise.id} className="border p-4 rounded shadow-sm">
          <div className="mb-2">
            <input
              type="text"
              className="text-lg font-semibold w-full"
              value={exercise.name}
              onChange={(e) => {
                const updated = [...exercises];
                updated[i].name = e.target.value;
                setExercises(updated);
              }}
            />
            <textarea
              className="mt-1 w-full text-sm border rounded p-2"
              placeholder="Notes"
              value={exercise.notes || ''}
              onChange={(e) => {
                const updated = [...exercises];
                updated[i].notes = e.target.value;
                setExercises(updated);
              }}
            />
          </div>

          {exercise.sets.map((set, j) => (
            <div key={set.id} className="grid grid-cols-5 gap-2 mb-2">
              <input
                type="number"
                className="border p-1 rounded"
                value={set.reps}
                onChange={(e) => handleSetChange(i, j, 'reps', parseInt(e.target.value))}
                placeholder="Reps"
              />
              <input
                type="number"
                className="border p-1 rounded"
                value={set.weight}
                onChange={(e) => handleSetChange(i, j, 'weight', parseFloat(e.target.value))}
                placeholder="Weight"
              />
              <input
                type="number"
                className="border p-1 rounded"
                value={set.rir}
                onChange={(e) => handleSetChange(i, j, 'rir', parseFloat(e.target.value))}
                placeholder="RIR"
              />
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={set.warmup || false}
                  onChange={(e) => handleSetChange(i, j, 'warmup', e.target.checked)}
                />
                <span className="text-xs">Warmup</span>
              </label>
              <button
                onClick={() => handleRemoveSet(i, j)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>          
          ))}

          <button onClick={() => handleAddSet(i)} className="px-4 py-2 bg-blue-500 rounded-lg text-slate-100">
            + Add Set
          </button>
          <button
            onClick={() => handleDeleteExercise(i)}
            className="ml-2 px-3 py-1 text-sm bg-red-500 text-white rounded"
          >
            Delete Exercise
          </button>

        </div>
      ))}

      <button
        onClick={handleAddExercise}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg"
      >
        + Add Exercise
      </button>

      <button onClick={handleSave} className="px-4 py-2 bg-green-600 rounded-lg text-slate-100">
        Save Workout
      </button>
    </div>
  );
}
