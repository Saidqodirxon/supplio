import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/public/home`, { next: { revalidate: 60 } });
    if (!res.ok) return NextResponse.json({ news: [], tariffs: [], settings: null, landing: null }, { status: 200 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ news: [], tariffs: [], settings: null, landing: null }, { status: 200 });
  }
}
