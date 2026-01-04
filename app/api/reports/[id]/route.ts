import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getReportByIdWithCoordinates } from '@/lib/postgis-helper';

// GET /api/reports/[id] - Get single report
export async function GET(
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

    const report = await getReportByIdWithCoordinates(reportId);

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Get reviewedBy data
    let reviewedBy = null;
    if (report.reviewedById) {
      reviewedBy = await prisma.user.findUnique({
        where: { id: report.reviewedById },
        select: {
          id: true,
          name: true,
          username: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        reviewedBy,
      },
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// PUT /api/reports/[id] - Update report (for future use)
export async function PUT(
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

    const body = await request.json();
    const { lat, lng, ...otherData } = body;

    // Update dengan atau tanpa location
    if (lat !== undefined && lng !== undefined) {
      const { Prisma } = await import('@prisma/client');
      
      await prisma.$executeRaw(
        Prisma.sql`
          UPDATE reports
          SET 
            location = ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326),
            "updatedAt" = NOW()
          WHERE id = ${reportId}
        `
      );
    }

    // Update fields lainnya jika ada
    if (Object.keys(otherData).length > 0) {
      await prisma.report.update({
        where: { id: reportId },
        data: otherData,
      });
    }

    const report = await getReportByIdWithCoordinates(reportId);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - Delete report
export async function DELETE(
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

    await prisma.report.delete({
      where: { id: reportId },
    });

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
