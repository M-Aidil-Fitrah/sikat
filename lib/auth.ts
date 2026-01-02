import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';

/**
 * Server-side authentication check
 * Use this in server components or server actions
 */
export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  
  if (!token) {
    redirect('/superuser?error=unauthorized');
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    redirect('/superuser?error=unauthorized');
  }
  
  return payload;
}

/**
 * Check if user is authenticated (returns boolean)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (!token) return false;
    
    const payload = await verifyToken(token);
    return !!payload;
  } catch {
    return false;
  }
}
