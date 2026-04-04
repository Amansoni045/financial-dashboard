-- AlterTable: FinancialRecord — add deletedAt (nullable) and updatedAt (default NOW for existing rows)
ALTER TABLE "FinancialRecord"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- AlterTable: User — add updatedAt (default NOW for existing rows)
ALTER TABLE "User"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
