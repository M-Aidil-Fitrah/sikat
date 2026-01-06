import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { InvalidReportFormInput, ApiResponse, InvalidReportWithReport } from '@/lib/types';

/**
 * POST /api/invalid-reports
 * Submit laporan keberatan (user dapat melaporkan laporan tidak valid)
 */
export async function POST(request: NextRequest) {
  try {
    const body: InvalidReportFormInput = await request.json();
    
    // Validasi input
    if (!body.reportId || !body.reason || body.reason.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Report ID dan alasan wajib diisi' } as ApiResponse,
        { status: 400 }
      );
    }

    // Cek apakah report exists
    const reportExists = await prisma.report.findUnique({
      where: { id: body.reportId }
    });

    if (!reportExists) {
      return NextResponse.json(
        { success: false, error: 'Laporan tidak ditemukan' } as ApiResponse,
        { status: 404 }
      );
    }

    // Create invalid report
    const invalidReport = await prisma.invalidReport.create({
      data: {
        reportId: body.reportId,
        reason: body.reason.trim(),
        reporterName: body.reporterName?.trim() || null,
        kontak: body.kontak?.trim() || null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Laporan tidak valid berhasil dikirim',
      data: invalidReport
    } as ApiResponse);

  } catch (error) {
    console.error('Error creating invalid report:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengirim laporan tidak valid' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/invalid-reports
 * Get semua invalid reports (admin only)
 * Query params:
 * - reportId: filter by report ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (reportId) {
      // Get invalid reports untuk report tertentu
      const invalidReports = await prisma.invalidReport.findMany({
        where: { reportId: parseInt(reportId) },
        include: {
          report: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        data: invalidReports,
        count: invalidReports.length
      } as ApiResponse<InvalidReportWithReport[]>);
    }

    // Get all invalid reports with report details
    const invalidReports = await prisma.invalidReport.findMany({
      include: {
        report: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Count per report
    const reportCounts = await prisma.invalidReport.groupBy({
      by: ['reportId'],
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      success: true,
      data: invalidReports,
      count: invalidReports.length
    } as ApiResponse<InvalidReportWithReport[]>);

  } catch (error) {
    console.error('Error fetching invalid reports:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data laporan tidak valid' } as ApiResponse,
      { status: 500 }
    );
  }
}
