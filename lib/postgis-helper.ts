/**
 * PostGIS Helper Functions
 * Utility untuk konversi antara PostGIS geometry dan lat/lng coordinates
 */

import prisma from './prisma';

/**
 * Interface untuk koordinat lat/lng
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Konversi lat/lng ke PostGIS Point geometry WKT (Well-Known Text)
 * Format: POINT(longitude latitude)
 */
export function coordinatesToWKT(lat: number, lng: number): string {
  return `POINT(${lng} ${lat})`;
}

/**
 * Parse PostGIS geometry ke koordinat lat/lng
 * Mendukung berbagai format: WKT, WKB, atau object dengan koordinat
 */
export function geometryToCoordinates(geometry: unknown): Coordinates | null {
  if (!geometry) return null;

  // Jika sudah dalam bentuk object dengan coordinates
  if (typeof geometry === 'object' && geometry !== null) {
    const geom = geometry as { coordinates?: number[]; x?: number; y?: number };
    
    // Format GeoJSON: { coordinates: [lng, lat] }
    if (geom.coordinates && Array.isArray(geom.coordinates) && geom.coordinates.length === 2) {
      return {
        lng: geom.coordinates[0],
        lat: geom.coordinates[1],
      };
    }
    
    // Format object: { x: lng, y: lat }
    if (typeof geom.x === 'number' && typeof geom.y === 'number') {
      return {
        lng: geom.x,
        lat: geom.y,
      };
    }
  }

  // Jika string WKT: "POINT(lng lat)"
  if (typeof geometry === 'string') {
    const match = geometry.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (match) {
      return {
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2]),
      };
    }
  }

  return null;
}

/**
 * Create report dengan PostGIS geometry
 */
export async function createReportWithLocation(data: {
  lat: number;
  lng: number;
  namaPelapor: string;
  kontak: string;
  desaKecamatan: string;
  namaObjek: string;
  jenisKerusakan: string;
  tingkatKerusakan: string;
  keteranganKerusakan: string;
  fotoLokasi: string[];
  status: string;
}) {
  const { lat, lng, ...reportData } = data;
  const { Prisma } = await import('@prisma/client');

  // Gunakan Prisma.$executeRaw untuk insert dengan PostGIS
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO reports (
        location,
        "namaPelapor",
        kontak,
        "desaKecamatan",
        "namaObjek",
        "jenisKerusakan",
        "tingkatKerusakan",
        "keteranganKerusakan",
        "fotoLokasi",
        status,
        "submittedAt",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
        ${reportData.namaPelapor},
        ${reportData.kontak},
        ${reportData.desaKecamatan},
        ${reportData.namaObjek},
        ${reportData.jenisKerusakan},
        ${reportData.tingkatKerusakan}::"TingkatKerusakan",
        ${reportData.keteranganKerusakan},
        ${reportData.fotoLokasi}::text[],
        ${reportData.status}::"ReportStatus",
        NOW(),
        NOW(),
        NOW()
      )
    `
  );

  // Get the created report
  const reports = await prisma.$queryRaw<Array<{ id: number }>>(
    Prisma.sql`SELECT id FROM reports ORDER BY id DESC LIMIT 1`
  );

  return reports[0].id;
}

/**
 * Get reports dengan koordinat lat/lng yang sudah di-extract
 */
export async function getReportsWithCoordinates(whereClause?: {
  status?: string;
  id?: number;
}) {
  let query = `
    SELECT 
      id,
      ST_X(location::geometry) as lng,
      ST_Y(location::geometry) as lat,
      "namaPelapor",
      kontak,
      "desaKecamatan",
      "namaObjek",
      "jenisKerusakan",
      "tingkatKerusakan",
      "fotoLokasi",
      "keteranganKerusakan",
      status,
      "submittedAt",
      "reviewedAt",
      "reviewedById",
      "reviewNote",
      "autoApproved",
      "createdAt",
      "updatedAt"
    FROM reports
  `;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (whereClause?.status) {
    conditions.push(`status = $${params.length + 1}`);
    params.push(whereClause.status);
  }

  if (whereClause?.id) {
    conditions.push(`id = $${params.length + 1}`);
    params.push(whereClause.id);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY "submittedAt" DESC';

  // Gunakan queryRaw dengan tagged template untuk type safety
  // Note: Gunakan Prisma.sql untuk avoid type casting issues
  const { Prisma } = await import('@prisma/client');
  
  if (whereClause?.status && whereClause?.id) {
    return await prisma.$queryRaw<Array<ReportWithCoordinates>>(
      Prisma.sql`
        SELECT 
          id,
          ST_X(location::geometry) as lng,
          ST_Y(location::geometry) as lat,
          "namaPelapor",
          kontak,
          "desaKecamatan",
          "namaObjek",
          "jenisKerusakan",
          "tingkatKerusakan"::text as "tingkatKerusakan",
          "fotoLokasi",
          "keteranganKerusakan",
          status::text as status,
          "submittedAt",
          "reviewedAt",
          "reviewedById",
          "reviewNote",
          "autoApproved",
          "createdAt",
          "updatedAt"
        FROM reports
        WHERE status::text = ${whereClause.status} AND id = ${whereClause.id}
        ORDER BY "submittedAt" DESC
      `
    );
  } else if (whereClause?.status) {
    return await prisma.$queryRaw<Array<ReportWithCoordinates>>(
      Prisma.sql`
        SELECT 
          id,
          ST_X(location::geometry) as lng,
          ST_Y(location::geometry) as lat,
          "namaPelapor",
          kontak,
          "desaKecamatan",
          "namaObjek",
          "jenisKerusakan",
          "tingkatKerusakan"::text as "tingkatKerusakan",
          "fotoLokasi",
          "keteranganKerusakan",
          status::text as status,
          "submittedAt",
          "reviewedAt",
          "reviewedById",
          "reviewNote",
          "autoApproved",
          "createdAt",
          "updatedAt"
        FROM reports
        WHERE status::text = ${whereClause.status}
        ORDER BY "submittedAt" DESC
      `
    );
  } else if (whereClause?.id) {
    return await prisma.$queryRaw<Array<ReportWithCoordinates>>(
      Prisma.sql`
        SELECT 
          id,
          ST_X(location::geometry) as lng,
          ST_Y(location::geometry) as lat,
          "namaPelapor",
          kontak,
          "desaKecamatan",
          "namaObjek",
          "jenisKerusakan",
          "tingkatKerusakan"::text as "tingkatKerusakan",
          "fotoLokasi",
          "keteranganKerusakan",
          status::text as status,
          "submittedAt",
          "reviewedAt",
          "reviewedById",
          "reviewNote",
          "autoApproved",
          "createdAt",
          "updatedAt"
        FROM reports
        WHERE id = ${whereClause.id}
        ORDER BY "submittedAt" DESC
      `
    );
  } else {
    return await prisma.$queryRaw<Array<ReportWithCoordinates>>(
      Prisma.sql`
        SELECT 
          id,
          ST_X(location::geometry) as lng,
          ST_Y(location::geometry) as lat,
          "namaPelapor",
          kontak,
          "desaKecamatan",
          "namaObjek",
          "jenisKerusakan",
          "tingkatKerusakan"::text as "tingkatKerusakan",
          "fotoLokasi",
          "keteranganKerusakan",
          status::text as status,
          "submittedAt",
          "reviewedAt",
          "reviewedById",
          "reviewNote",
          "autoApproved",
          "createdAt",
          "updatedAt"
        FROM reports
        ORDER BY "submittedAt" DESC
      `
    );
  }
}

/**
 * Get single report dengan koordinat
 */
export async function getReportByIdWithCoordinates(id: number) {
  const { Prisma } = await import('@prisma/client');
  
  const reports = await prisma.$queryRaw<Array<ReportWithCoordinates>>(
    Prisma.sql`
      SELECT 
        id,
        ST_X(location::geometry) as lng,
        ST_Y(location::geometry) as lat,
        "namaPelapor",
        kontak,
        "desaKecamatan",
        "namaObjek",
        "jenisKerusakan",
        "tingkatKerusakan"::text as "tingkatKerusakan",
        "fotoLokasi",
        "keteranganKerusakan",
        status::text as status,
        "submittedAt",
        "reviewedAt",
        "reviewedById",
        "reviewNote",
        "autoApproved",
        "createdAt",
        "updatedAt"
      FROM reports
      WHERE id = ${id}
    `
  );

  return reports[0] || null;
}

/**
 * Update report location
 */
export async function updateReportLocation(id: number, lat: number, lng: number) {
  const { Prisma } = await import('@prisma/client');
  
  await prisma.$executeRaw(
    Prisma.sql`
      UPDATE reports
      SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          "updatedAt" = NOW()
      WHERE id = ${id}
    `
  );
}

/**
 * Find reports within radius (spatial query)
 * @param lat Latitude pusat pencarian
 * @param lng Longitude pusat pencarian
 * @param radiusKm Radius dalam kilometer
 */
export async function findReportsWithinRadius(
  lat: number,
  lng: number,
  radiusKm: number
) {
  const { Prisma } = await import('@prisma/client');
  
  return await prisma.$queryRaw<Array<ReportWithCoordinates & { distance_km: number }>>(
    Prisma.sql`
      SELECT 
        id,
        ST_X(location::geometry) as lng,
        ST_Y(location::geometry) as lat,
        "namaPelapor",
        kontak,
        "desaKecamatan",
        "namaObjek",
        "jenisKerusakan",
        "tingkatKerusakan"::text as "tingkatKerusakan",
        "fotoLokasi",
        "keteranganKerusakan",
        status::text as status,
        "submittedAt",
        "reviewedAt",
        "reviewedById",
        "reviewNote",
        "autoApproved",
        "createdAt",
        "updatedAt",
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) / 1000 as distance_km
      FROM reports
      WHERE ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusKm * 1000}
      )
      ORDER BY distance_km ASC
    `
  );
}

/**
 * Type untuk Report dengan koordinat
 */
export interface ReportWithCoordinates {
  id: number;
  lat: number;
  lng: number;
  namaPelapor: string;
  kontak: string;
  desaKecamatan: string;
  namaObjek: string;
  jenisKerusakan: string;
  tingkatKerusakan: string;
  fotoLokasi: string[];
  keteranganKerusakan: string;
  status: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedById: number | null;
  reviewNote: string | null;
  autoApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
