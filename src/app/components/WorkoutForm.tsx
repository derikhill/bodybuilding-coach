import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useState } from 'react';
import supabase from '@/lib/supabase';
// import { v4 as uuidv4 } from 'uuid';

interface SetForm {
  set_number: number;
  reps: number;
  weight: number;
  rir: number;
  warmup: boolean;
}

interface ExerciseForm {
  name: string;
  is_superset: boolean;
  notes: string;
  sets: SetForm[];
}

interface WorkoutFormInputs {
  title: string;
  workout_type: string;
  notes: string;
  date: string;
  exercises: ExerciseForm[];
}

export default function WorkoutForm({ userId, onNewWorkout, goBack }: { userId: string, onNewWorkout: () => void, goBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: {},
  } = useForm<WorkoutFormInputs>({
    defaultValues: {
      title: '',
      workout_type: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      exercises: [],
    },
  });

  const { fields: exercises, append: appendExercise, remove: removeExercise } =
    useFieldArray({ control, name: 'exercises' });

  const onSubmit = async (data: WorkoutFormInputs) => {
    try {
      setLoading(true);
      const { title, workout_type, notes, date, exercises } = data;
      const exercisesToLog = exercises.map((exercise, index) => ({
        ...exercise,
        order_index: index,
        sets: exercise.sets.filter(set => 
          set.reps > 0
        ),
      }));
      

      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: userId,
          title,
          workout_type,
          notes,
          date,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      for (const exercise of exercisesToLog) {
        const { data: insertedExercise, error: exerciseError } = await supabase
          .from("exercises")
          .insert({
            order_index: exercise.order_index,
            workout_id: workout.id,
            name: exercise.name,
            is_superset: exercise.is_superset,
            notes: exercise.notes,
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        const setsPayload = exercise.sets.map((set, index) => ({
          exercise_id: insertedExercise.id,
          set_number: index + 1,
          warmup: set.warmup,
          reps: set.reps,
          weight: set.weight,
          rir: set.rir,
        }));

        if (setsPayload.length > 0) {
          const { error: setsError } = await supabase.from("sets").insert(setsPayload);
          if (setsError) throw setsError;
        }
      }

      reset();
      console.log("Workout submitted successfully!");
      onNewWorkout();
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div>
      <button onClick={goBack} className="text-sm text-blue-400 hover:underline mb-4">
        ← Back to Dashboard
      </button>
      {/* rest of the form */}
    </div>
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl space-y-6 justify-self-center">
      <div>
        <label className="block mb-1 font-medium text-slate-100">Workout Title</label>
        <input {...register('title', { required: true })} className="bg-gray-50 border input py-2 w-full rounded" />
      </div>

      <div>
        <label className="block mb-1 font-medium text-slate-100">Date</label>
        <input
          type="date"
          {...register('date', { required: true })}
          className="bg-gray-50 border py-2 px-3 w-full rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-slate-100">Workout Type</label>
        <select {...register('workout_type', { required: true })} className="bg-gray-50 py-2 w-full rouunded">
          <option value="">Select type</option>
          <option value="strength">Strength</option>
          <option value="hypertrophy">Hypertrophy</option>
          <option value="endurance">Endurance</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium text-slate-100">Notes</label>
        <textarea {...register('notes')} className="bg-gray-50 py-2 w-full rouunded" />
      </div>

      <div>
        <h3 className="font-semibold text-lg text-slate-100">Exercises</h3>
        {exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="bg-gray-50 border flex flex-col mt-4 p-4 rounded">
            <label className="block mb-1 font-medium">Exercise name</label>
            <input
              {...register(`exercises.${exerciseIndex}.name`, { required: true })}
              placeholder="Exercise name"
              className="input mb-2 rounded border p-2"
            />
            <label className="block mb-1 font-medium">Notes</label>            

            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                {...register(`exercises.${exerciseIndex}.is_superset`)}
              />
              <span>Superset</span>
            </label>

            <Controller
              control={control}
              name={`exercises.${exerciseIndex}.sets`}
              defaultValue={[]}
              render={({ field }) => (
                <div className="mt-4 space-y-4">
                  {field.value.map((set, setIndex) => (
                    <div key={setIndex} className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 border p-3 rounded bg-stone-200">

                      <div className='flex flex-row space-x-2'>
                        <input
                          type="number"
                          placeholder="Weight"
                          value={set.weight || ''}
                          onFocus={() => {
                            if (!set.weight && setIndex > 0) {
                              const newSets = [...field.value];
                              newSets[setIndex].weight = field.value[setIndex - 1].weight;
                              field.onChange(newSets);
                            }
                          }}
                          onChange={(e) => {
                            const newSets = [...field.value];
                            newSets[setIndex].weight = Number(e.target.value);
                            field.onChange(newSets);
                          }}
                          className="input w-full md:w-24 border border-slate-400 rounded p-2"
                        />

                        <input
                          type="number"
                          placeholder="Reps"
                          value={set.reps || ''}
                          onFocus={() => {
                            if (!set.reps && setIndex > 0) {
                              const newSets = [...field.value];
                              newSets[setIndex].reps = field.value[setIndex - 1].reps;
                              field.onChange(newSets);
                            }
                          }}
                          onChange={(e) => {
                            const newSets = [...field.value];
                            newSets[setIndex].reps = Number(e.target.value);
                            field.onChange(newSets);
                          }}
                          className="input w-full md:w-24 border border-slate-400 rounded p-2"
                        />
                      </div>

                      <div className='flex flex-row space-x-2'>
                        <select
                          value={set.rir || ''}
                          onChange={(e) => {
                            const newSets = [...field.value];
                            newSets[setIndex].rir = Number(e.target.value);
                            field.onChange(newSets);
                          }}
                          className="bg-gray-50 p-2 w-full md:w-24 border rounded"
                        >
                          <option value="">RIR</option>
                          <option key={0} value={0}>0</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                        <div className="flex items-center space-x-2">
                          <label htmlFor={`warmup-toggle-${setIndex}`} className="text-sm">
                            Warmup
                          </label>
                          <button
                            id={`warmup-toggle-${setIndex}`}
                            type="button"
                            role="switch"
                            aria-checked={set.warmup || false}
                            onClick={() => {
                              const newSets = [...field.value];
                              newSets[setIndex].warmup = !set.warmup;
                              field.onChange(newSets);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              set.warmup ? 'bg-blue-600' : 'bg-gray-400'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                set.warmup ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newSets = field.value.filter((_, i) => i !== setIndex);
                          field.onChange(newSets);
                        }}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      field.onChange([
                        ...field.value,
                        { set_number: field.value.length + 1, reps: 0, weight: 0, rir: 0, warmup: false }
                      ])
                    }
                    className="mt-2 text-blue-500 hover:underline"
                  >
                    + Add Set
                  </button>
                </div>
              )}
            />

            <textarea
              {...register(`exercises.${exerciseIndex}.notes`)}
              placeholder="Exercise notes"
              className="textarea mb-2 rounded border"
            />

            <button
              type="button"
              onClick={() => removeExercise(exerciseIndex)}
              className="text-red-500 mt-4 text-left"
            >
              Remove Exercise
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            appendExercise({
              name: '',
              is_superset: false,
              notes: '',
              sets: [
                { set_number: 1, reps: 0, weight: 0, rir: 0, warmup: false },
                { set_number: 2, reps: 0, weight: 0, rir: 0, warmup: false },
                { set_number: 3, reps: 0, weight: 0, rir: 0, warmup: false }
              ]
            })
          }
          className="mt-4 text-blue-700"
        >
          + Add Exercise
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? 'Saving...' : 'Save Workout'}
      </button>
    </form>
    </>
  );
}
