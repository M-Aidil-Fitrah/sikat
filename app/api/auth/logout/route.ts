import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/logout
export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logout successful',
  });

  // Clear cookie
  response.cookies.delete('admin-token');

  return response;
}
