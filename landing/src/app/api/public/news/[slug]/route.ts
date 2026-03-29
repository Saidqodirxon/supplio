import { NextRequest, NextResponse } from 'next/server';

function normalizeBackendBaseUrl(rawUrl?: string) {
  const fallback = 'http://localhost:5000';
  const value = (rawUrl || fallback).trim().replace(/\/+$/, '');
  return value.endsWith('/api') ? value.slice(0, -4) : value;
}

const BACKEND = normalizeBackendBaseUrl(process.env.BACKEND_URL);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'uz';

  try {
    const res = await fetch(`${BACKEND}/api/public/news/${slug}?lang=${lang}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return NextResponse.json(null, { status: 404 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null, { status: 404 });
  }
}
