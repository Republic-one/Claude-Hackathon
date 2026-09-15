import { NextResponse } from 'next/server';
import { runModelEvaluation, getCachedEvaluation } from '@/services/evaluation/evaluator';

export async function GET() {
  try {
    const cached = getCachedEvaluation();
    if (!cached) {
      const fresh = runModelEvaluation();
      return NextResponse.json(fresh);
    }
    return NextResponse.json(cached);
  } catch (error: any) {
    return NextResponse.json({ error: 'Evaluation failed', details: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const fresh = runModelEvaluation();
    return NextResponse.json(fresh);
  } catch (error: any) {
    return NextResponse.json({ error: 'Evaluation failed to run', details: error.message }, { status: 500 });
  }
}
