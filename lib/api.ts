/**
 * API Client untuk SIKAT
 * Handle semua HTTP requests ke backend dengan type-safe
 */

import type {
  Report,
  ReportFormInput,
  ApiResponse,
  UploadResponse,
  User,
  LoginCredentials,
  UpdateReportStatus,
  DisasterData,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Generic fetch wrapper dengan error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== PUBLIC ENDPOINTS ====================

/**
 * GET /api/reports - Fetch approved reports (untuk public display)
 */
export async function getReports(): Promise<DisasterData[]> {
  const response = await fetchAPI<DisasterData[]>('/api/reports');
  return response.data || [];
}

/**
 * GET /api/reports/:id - Fetch single report
 */
export async function getReportById(id: number): Promise<Report> {
  const response = await fetchAPI<Report>(`/api/reports/${id}`);
  if (!response.data) {
    throw new Error('Report not found');
  }
  return response.data;
}

/**
 * POST /api/reports - Submit new report
 */
export async function createReport(data: ReportFormInput): Promise<Report> {
  const response = await fetchAPI<Report>('/api/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.data) {
    throw new Error(response.error || 'Failed to create report');
  }

  return response.data;
}

/**
 * POST /api/upload - Upload photos
 */
export async function uploadPhotos(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
    });

    const data: UploadResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to upload photos');
    }

    return data.files || [];
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

// ==================== AUTH ENDPOINTS ====================

/**
 * POST /api/auth/login - Admin login
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await fetchAPI<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    credentials: 'include', // Include cookies
  });

  if (!response.success) {
    throw new Error(response.error || 'Login failed');
  }

  return response.data!;
}

/**
 * POST /api/auth/logout - Admin logout
 */
export async function logout(): Promise<void> {
  await fetchAPI('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * GET /api/auth/me - Get current logged in user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetchAPI<User>('/api/auth/me', {
      credentials: 'include',
    });
    return response.data || null;
  } catch {
    return null;
  }
}

// ==================== ADMIN ENDPOINTS ====================

/**
 * GET /api/admin/reports - Fetch all reports (all statuses)
 */
export async function getAdminReports(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Report[]>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const endpoint = `/api/admin/reports${searchParams.toString() ? `?${searchParams}` : ''}`;
  
  return fetchAPI<Report[]>(endpoint, {
    credentials: 'include',
  });
}

/**
 * PUT /api/admin/reports/:id/status - Update report status (approve/reject)
 */
export async function updateReportStatus(
  id: number,
  data: UpdateReportStatus
): Promise<Report> {
  const response = await fetchAPI<Report>(`/api/admin/reports/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.data) {
    throw new Error(response.error || 'Failed to update status');
  }

  return response.data;
}

/**
 * DELETE /api/reports/:id - Delete report (admin only)
 */
export async function deleteReport(id: number): Promise<void> {
  await fetchAPI(`/api/reports/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}
