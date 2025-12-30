import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAdminRoute =
    req.nextUrl.pathname.startsWith("/api/laporan/verifikasi");

  if (!isAdminRoute) return NextResponse.next();

  const adminKey = req.headers.get("x-admin-key");

  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized (Admin only)" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}
