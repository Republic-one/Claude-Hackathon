import { NextResponse } from 'next/server';
import { generateWeeklyReports } from '@/services/reports/generator';

export async function GET() {
  try {
    const data = await generateWeeklyReports();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'Failed to generate weekly reports', details: error.message }, { status: 500 });
  }
}
