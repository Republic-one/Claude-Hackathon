import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'config', 'departments.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to read departments', details: error.message }, { status: 500 });
  }
}
