-- Supplio Company Export
-- Company: Supplio Demo
-- Exported: 2026-04-19T22:06:41.831Z
-- ID: 49e18d1f-089d-482a-81c8-b11f0c8a067a

-- Branch (1 rows)
INSERT INTO "Branch" ("id", "companyId", "name", "address", "phone", "createdAt", "updatedAt", "deletedAt", "deletedBy") VALUES ('021f39ca-2b92-4d45-8549-3c02e4493d1e', '49e18d1f-089d-482a-81c8-b11f0c8a067a', 'Main distribution Hub', 'Demo City, St 1', NULL, '2026-03-29T16:14:07.181Z', '2026-03-29T16:14:07.181Z', NULL, NULL) ON CONFLICT DO NOTHING;

-- Dealer: empty
-- Product: empty
-- Order: empty
-- Payment: empty
-- Expense: empty
-- User (1 rows)
INSERT INTO "User" ("id", "companyId", "branchId", "phone", "fullName", "roleType", "isActive", "createdAt") VALUES ('baca4a8f-4f48-4e6e-8136-caa015acf033', '49e18d1f-089d-482a-81c8-b11f0c8a067a', NULL, '+998000000000', 'Demo Distributor', 'OWNER', TRUE, '2026-03-28T19:58:28.472Z') ON CONFLICT DO NOTHING;

