import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ReportStatus } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

// PATCH /api/admin/reports/[id]/status - Update report status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = parseInt(id);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const adminId = payload.userId;

    const { status, reviewNote } = await request.json();

    // Validate status
    if (!status || !Object.values(ReportStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: status as ReportStatus,
        reviewedAt: new Date(),
        reviewedById: adminId,
        reviewNote: reviewNote || null,
      },
      include: {
        reviewedBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    const statusText = 
      status === ReportStatus.APPROVED ? 'diverifikasi' :
      status === ReportStatus.REJECTED ? 'ditolak' : 'diubah';

    return NextResponse.json({
      success: true,
      message: `Laporan berhasil ${statusText}`,
      data: updatedReport,
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update report status' },
      { status: 500 }
    );
  }
}
