import { Report, ReportStatus } from '@prisma/client';
import prisma from './prisma';

/**
 * Auto-approve reports yang sudah pending lebih dari 3 hari
 * Function ini bisa dipanggil via cron job atau saat fetch reports
 */
export async function autoApproveOldReports(): Promise<number> {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    // Create WIB date (UTC+7) to match how submittedAt/createdAt are stored
    const wibDate = new Date(Date.now() + (7 * 60 * 60 * 1000));
    
    const result = await prisma.report.updateMany({
      where: {
        status: ReportStatus.PENDING,
        submittedAt: {
          lte: threeDaysAgo,
        },
      },
      data: {
        status: ReportStatus.APPROVED,
        autoApproved: true,
        reviewedAt: wibDate,
        reviewNote: 'Auto-approved: Tidak ada tindakan admin dalam 3 hari',
        updatedAt: wibDate,
      },
    });

    console.log(`Auto-approved ${result.count} reports`);
    return result.count;
  } catch (error) {
    console.error('Error auto-approving reports:', error);
    throw error;
  }
}

/**
 * Check jika sebuah report sudah melewati batas waktu 3 hari
 */
export function isReportExpired(report: Report): boolean {
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  const submittedTime = new Date(report.submittedAt).getTime();
  const now = Date.now();
  
  return (now - submittedTime) > threeDaysInMs;
}

/**
 * Get semua reports yang akan segera auto-approve (dalam 24 jam ke depan)
 */
export async function getReportsNearAutoApproval(): Promise<Report[]> {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    const reports = await prisma.report.findMany({
      where: {
        status: ReportStatus.PENDING,
        submittedAt: {
          gte: threeDaysAgo,
          lte: twoDaysAgo,
        },
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });

    return reports;
  } catch (error) {
    console.error('Error fetching reports near auto-approval:', error);
    throw error;
  }
}
