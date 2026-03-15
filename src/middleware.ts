import { NextRequest, NextResponse } from 'next/server';

// Route protection is handled client-side via layout guards
// Middleware is kept minimal for performance
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = { matcher: [] };
