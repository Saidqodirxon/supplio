-- AlterTable: Add region, district, contactPhone to Dealer
ALTER TABLE "Dealer"
ADD COLUMN IF NOT EXISTS "region" TEXT,
ADD COLUMN IF NOT EXISTS "district" TEXT,
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;

-- AlterTable: Add imageUrl to SupportMessage
ALTER TABLE "SupportMessage"
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
