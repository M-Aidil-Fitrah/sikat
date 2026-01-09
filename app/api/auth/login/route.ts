import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/jwt';

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 [LOGIN] Request received'); // DEBUG LOG
    
    const { username, password } = await request.json();
    console.log('🔐 [LOGIN] Username:', username); // DEBUG LOG

    if (!username || !password) {
      console.log('❌ [LOGIN] Missing credentials'); // DEBUG LOG
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    console.log('🔐 [LOGIN] User found:', user ? 'YES' : 'NO'); // DEBUG LOG

    if (!user) {
      console.log('❌ [LOGIN] User not found'); // DEBUG LOG
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('🔐 [LOGIN] Verifying password...'); // DEBUG LOG
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 [LOGIN] Password valid:', isValidPassword); // DEBUG LOG

    if (!isValidPassword) {
      console.log('❌ [LOGIN] Invalid password'); // DEBUG LOG
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Generate JWT token
    console.log('🔐 [LOGIN] Generating token...'); // DEBUG LOG
    const token = await signToken({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
    console.log('✅ [LOGIN] Token generated (length):', token.length); // DEBUG LOG

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set JWT cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttps = request.url.startsWith('https://');
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      // secure: true HANYA jika production DAN HTTPS
      // Ini mencegah cookie ditolak browser di HTTP testing
      secure: isProduction && isHttps,
      // strict di production HTTPS untuk keamanan maksimal
      sameSite: isProduction && isHttps ? 'strict' : 'lax',
      maxAge: 60 * 60 * 12, // 12 hours (sesuai dengan JWT expiration)
      path: '/',
    });

    console.log('✅ [LOGIN] Cookie set - Production:', isProduction, 'HTTPS:', isHttps, 'Secure:', isProduction && isHttps); // DEBUG LOG

    return response;
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
