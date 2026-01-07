import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import type { ApiResponse } from '@/lib/types';

/**
 * DELETE /api/admin/invalid-reports/[id]
 * Delete a specific invalid report (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication (admin only)
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' } as ApiResponse,
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' } as ApiResponse,
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if invalid report exists
    const invalidReport = await prisma.invalidReport.findUnique({
      where: { id },
    });

    if (!invalidReport) {
      return NextResponse.json(
        { success: false, error: 'Invalid report not found' } as ApiResponse,
        { status: 404 }
      );
    }

    // Delete the invalid report
    await prisma.invalidReport.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Invalid report deleted successfully',
    } as ApiResponse);

  } catch (error) {
    console.error('Error deleting invalid report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete invalid report' } as ApiResponse,
      { status: 500 }
    );
  }
}
