import { createClient } from '@supabase/supabase-js'; // adjust this path based on your project structure

export async function getNutritionLogsLast7Days(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // last 7 days
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching nutrition logs:', error);
    return [];
  }

  return data || [];
}
