import { NextResponse } from 'next/server';

function normalizeBackendBaseUrl(rawUrl?: string) {
  const fallback = 'http://localhost:5000';
  const value = (rawUrl || fallback).trim().replace(/\/+$/, '');
  return value.endsWith('/api') ? value.slice(0, -4) : value;
}

const BACKEND = normalizeBackendBaseUrl(process.env.BACKEND_URL);

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
