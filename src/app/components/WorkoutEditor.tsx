'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase from '@/lib/supabase';

export default function WorkoutEditor({ workout }) {
  const [title, setTitle] = useState(workout.title);
  const [date, setDate] = useState(workout.date);
  const [exercises, setExercises] = useState(workout.exercises || []);

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const handleAddSet = (exerciseIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({
      id: uuidv4(),
      set_number: updatedExercises[exerciseIndex].sets.length + 1,
      reps: 0,
      weight: 0,
      rir: 0,
    });
    setExercises(updatedExercises);
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updatedExercises);
  };
  
  const handleDeleteExercise = (exerciseIndex) => {
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
      },
    ]);
  };

  const handleSave = async () => {
    const { error: workoutError } = await supabase
      .from('workouts')
      .update({ title, date })
      .eq('id', workout.id);
  
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
