-- CreateTable
CREATE TABLE "invalid_reports" (
    "id" TEXT NOT NULL,
    "reportId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reporterName" TEXT,
    "kontak" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invalid_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invalid_reports_reportId_idx" ON "invalid_reports"("reportId");

-- CreateIndex
CREATE INDEX "invalid_reports_createdAt_idx" ON "invalid_reports"("createdAt");

-- AddForeignKey
ALTER TABLE "invalid_reports" ADD CONSTRAINT "invalid_reports_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
