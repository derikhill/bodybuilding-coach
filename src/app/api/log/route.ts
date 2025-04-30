import { NextRequest, NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userProfile, nutritionLog, workoutLog, progressMetrics } = body;

  const prompt = `You are a bodybuilding coach.\n\nUser Profile:\n- Age: ${userProfile.age}\n- Height: ${userProfile.height_cm} cm\n- Weight: ${userProfile.weight_kg} kg\n- Body fat: ${userProfile.bodyFatPercent}%\n- Goal: ${userProfile.goal}\n\nToday's Nutrition:\n- Calories: ${nutritionLog.totalCalories}\n- Protein: ${nutritionLog.protein_g}g\n- Carbs: ${nutritionLog.carbs_g}g\n- Fat: ${nutritionLog.fat_g}g\n\nWorkout:\n- Name: ${workoutLog.workoutName}\n- Notes: ${workoutLog.notes}\n\nProgress:\n- Weight: ${progressMetrics.weight_kg} kg\n- Waist: ${progressMetrics.waist_cm} cm\n- Sleep: ${progressMetrics.sleep_hours} hours\n- Fatigue: ${progressMetrics.fatigue_level}\n\nGive personalized feedback on training and nutrition.`;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful bodybuilding coach.' },
      { role: 'user', content: prompt }
    ]
  });

  return NextResponse.json({ feedback: response.data.choices[0].message?.content });
}
