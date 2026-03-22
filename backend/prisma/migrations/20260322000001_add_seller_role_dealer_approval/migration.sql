-- Add SELLER to RoleType enum
ALTER TYPE "RoleType" ADD VALUE 'SELLER';

-- Add approval fields to Dealer
ALTER TABLE "Dealer" ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Dealer" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "Dealer" ADD COLUMN "approvedBy" TEXT;

-- Create DealerApprovalRequest table
CREATE TABLE "DealerApprovalRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "DealerApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "DealerApprovalRequest" ADD CONSTRAINT "DealerApprovalRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DealerApprovalRequest" ADD CONSTRAINT "DealerApprovalRequest_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
