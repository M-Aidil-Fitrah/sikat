import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ReportStatus } from '@prisma/client';
import { autoApproveOldReports } from '@/lib/auto-approve';

// GET /api/admin/reports - Get all reports with all statuses (admin only)
export async function GET(request: NextRequest) {
  try {
    // Auto-approve old reports
    await autoApproveOldReports();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Filter by status
    if (status && Object.values(ReportStatus).includes(status as ReportStatus)) {
      whereClause.status = status as ReportStatus;
    }

    const [reports, totalCount] = await Promise.all([
      prisma.report.findMany({
        where: whereClause,
        include: {
          reviewedBy: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.report.count({ where: whereClause }),
    ]);

    // Get counts by status
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.report.count({ where: { status: ReportStatus.APPROVED } }),
      prisma.report.count({ where: { status: ReportStatus.REJECTED } }),
    ]);

    return NextResponse.json({
      success: true,
      data: reports,
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
