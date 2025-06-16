'use client';

import { useForm } from 'react-hook-form';
import supabase from '@/lib/supabase'; // adjust if needed

interface NutritionLogFormProps {
  userId: string;
  goBack: () => void;
}

interface NutritionLogFormData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

export default function NutritionLogForm({ userId, goBack }: NutritionLogFormProps) {
  const { register, handleSubmit, reset } = useForm<NutritionLogFormData>();

  const onSubmit = async (data: NutritionLogFormData) => {
    const { error } = await supabase.from('nutrition_logs').insert([
      {
        ...data,
        user_id: userId, // ⚡ Replace this dynamically later when you have auth
      },
    ]);

    if (error) {
      console.error(error);
      alert('Failed to save log');
    } else {
      reset(); // Clear form after submit
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
        <label className="block mb-1 font-medium text-slate-100">Date</label>
        <input
          type="date"
          {...register('date', { required: true })}
          className="bg-gray-50 border py-2 px-3 w-full rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium text-slate-100">Calories</label>
          <input
            type="number"
            {...register('calories', { required: true, min: 0 })}
            className="bg-gray-50 border py-2 px-3 w-full rounded"
            placeholder="e.g. 2800"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-slate-100">Protein (g)</label>
          <input
            type="number"
            {...register('protein', { required: true, min: 0 })}
            className="bg-gray-50 border py-2 px-3 w-full rounded"
            placeholder="e.g. 240"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-slate-100">Carbs (g)</label>
          <input
            type="number"
            {...register('carbs', { required: true, min: 0 })}
            className="bg-gray-50 border py-2 px-3 w-full rounded"
            placeholder="e.g. 300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-slate-100">Fat (g)</label>
          <input
            type="number"
            {...register('fat', { required: true, min: 0 })}
            className="bg-gray-50 border py-2 px-3 w-full rounded"
            placeholder="e.g. 60"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium text-slate-100">Notes</label>
        <textarea
          {...register('notes')}
          className="bg-gray-50 border py-2 px-3 w-full rounded"
          placeholder="Optional notes like 'recovery day' or 'high carb day'"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-all"
      >
        Save Nutrition Log
      </button>
    </form>
    </>
  );
}
