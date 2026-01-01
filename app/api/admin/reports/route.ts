import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ReportStatus } from '@prisma/client';
import { autoApproveOldReports } from '@/lib/auto-approve';
import { verifyToken } from '@/lib/jwt';
import { getReportsWithCoordinates } from '@/lib/postgis-helper';

// GET /api/admin/reports - Get all reports with all statuses (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Auto-approve old reports
    await autoApproveOldReports();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get reports dengan koordinat dari PostGIS
    const allReports = await getReportsWithCoordinates(
      status && Object.values(ReportStatus).includes(status as ReportStatus)
        ? { status }
        : undefined
    );

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedReports = allReports.slice(skip, skip + limit);
    const totalCount = allReports.length;

    // Get reviewedBy data untuk setiap report
    const reportIds = paginatedReports
      .map(r => r.reviewedById)
      .filter((id): id is number => id !== null);
    
    const users = reportIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: reportIds } },
          select: { id: true, name: true, username: true },
        })
      : [];

    const usersMap = new Map(users.map(u => [u.id, u]));

    // Transform data dengan reviewedBy
    const transformedReports = paginatedReports.map((report) => ({
      ...report,
      reviewedBy: report.reviewedById ? usersMap.get(report.reviewedById) || null : null,
    }));

    // Get counts by status
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.report.count({ where: { status: ReportStatus.APPROVED } }),
      prisma.report.count({ where: { status: ReportStatus.REJECTED } }),
    ]);

    return NextResponse.json({
      success: true,
      reports: transformedReports,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
