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
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Extract dan validate payload
    if (!payload || typeof payload !== 'object') {
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
    console.error('JWT verification failed:', error);
    return null;
  }
}
