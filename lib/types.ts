/**
 * Type definitions untuk SIKAT
 * Sesuai dengan Prisma schema dan database
 */

// Enums dari Prisma
export enum TingkatKerusakan {
  Ringan = 'Ringan',
  Sedang = 'Sedang',
  Berat = 'Berat',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Main Report interface (dari database)
export interface Report {
  id: number;
  lat: number;
  lng: number;
  namaPelapor: string;
  kontak: string;
  desaKecamatan: string;
  namaObjek: string;
  jenisKerusakan: string;
  tingkatKerusakan: TingkatKerusakan;
  fotoLokasi: string[];
  keteranganKerusakan: string;
  status: ReportStatus;
  submittedAt: Date | string;
  reviewedAt?: Date | string | null;
  reviewedById?: number | null;
  reviewNote?: string | null;
  autoApproved: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Relasi
  reviewedBy?: {
    id: number;
    name: string;
    username: string;
  } | null;
}

// Form input untuk submit laporan baru
export interface ReportFormInput {
  lat: number;
  lng: number;
  namaPelapor: string;
  kontak: string;
  desaKecamatan: string;
  namaObjek: string;
  jenisKerusakan: string;
  tingkatKerusakan: TingkatKerusakan;
  keteranganKerusakan: string;
  fotoLokasi: string[];
}

// Response dari API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

// Upload response
export interface UploadResponse {
  success: boolean;
  message: string;
  files: string[];
}

// User interface
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

// Login credentials
export interface LoginCredentials {
  username: string;
  password: string;
}

// Admin update status
export interface UpdateReportStatus {
  status: ReportStatus;
  reviewNote?: string;
}

// For MapComponent - display format with computed fields
export interface DisasterData extends Report {
  timestamp: string; // Computed: "2 jam lalu"
}
