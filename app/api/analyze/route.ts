import { NextRequest, NextResponse } from 'next/server';
import { runFullAnalysis } from '@/services/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, photoCaption, audioTranscription, latitude, longitude, manualLocality } = body;

    if (!text && !audioTranscription) {
      return NextResponse.json(
        { error: 'Please provide either complaint text or voice transcription' },
        { status: 400 }
      );
    }

    const analysis = await runFullAnalysis({
      text: text || '',
      photoCaption,
      audioTranscription,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      manualLocality,
    });

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error during AI analysis:', error);
    return NextResponse.json(
      { error: 'AI analysis failed', details: error.message },
      { status: 500 }
    );
  }
}
