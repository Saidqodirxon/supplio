-- Add isBlocked and cashbackBalance to Dealer
ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "cashbackBalance" FLOAT NOT NULL DEFAULT 0;

-- Add discountPrice and isPromo to Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "discountPrice" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isPromo" BOOLEAN NOT NULL DEFAULT false;

-- Add cashbackPercent to Company
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "cashbackPercent" FLOAT NOT NULL DEFAULT 0;
