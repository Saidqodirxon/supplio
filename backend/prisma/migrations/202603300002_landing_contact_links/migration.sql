-- AlterTable
ALTER TABLE "LandingContent"
ADD COLUMN IF NOT EXISTS "contactPhoneHref" TEXT,
ADD COLUMN IF NOT EXISTS "contactAddress" TEXT,
ADD COLUMN IF NOT EXISTS "contactAddressUrl" TEXT;
