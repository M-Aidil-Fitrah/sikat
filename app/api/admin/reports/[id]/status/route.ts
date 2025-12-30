import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ReportStatus } from '@prisma/client';

// PUT /api/admin/reports/[id]/status - Update report status (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const adminToken = request.cookies.get('admin-token');
    if (!adminToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminId = parseInt(adminToken.value);

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
