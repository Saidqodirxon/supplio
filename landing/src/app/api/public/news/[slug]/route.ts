import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

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
