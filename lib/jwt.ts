/**
 * JWT Token utilities
 * Untuk authentication admin yang aman
 */

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production-min-32-chars'
);

export interface JWTPayload {
  userId: number;
  username: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Create JWT token
 * @param payload - Data yang akan di-encode dalam token
 * @returns Signed JWT token string
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h') // Token expire dalam 12 jam
    .sign(JWT_SECRET);
}

/**
 * Verify and decode JWT token
 * @param token - JWT token string yang akan diverifikasi
 * @returns Decoded payload jika valid, null jika invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // jwtVerify akan automatically check expiration time
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Extract dan validate payload
    if (!payload || typeof payload !== 'object') {
      console.error('JWT payload invalid or missing');
      return null;
    }
    
    // Double check expiration (jose already checks, but we log for debugging)
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error('JWT token expired at:', new Date((payload.exp as number) * 1000).toISOString());
      return null;
    }
    
    return {
      userId: payload.userId as number,
      username: payload.username as string,
      name: payload.name as string,
      role: payload.role as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('JWT verification failed:', error.message);
      console.error('Token (first 30 chars):', token.substring(0, 30) + '...');
      // Check if it's an expiration error
      if (error.message.includes('expired')) {
        console.error('Token has expired - user needs to login again');
      } else if (error.message.includes('signature')) {
        console.error('Token signature invalid - likely JWT_SECRET mismatch or corrupted token');
      }
    } else {
      console.error('JWT verification failed:', error);
    }
    return null;
  }
}
