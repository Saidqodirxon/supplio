-- Supplio Company Export
-- Company: Supplio Demo
-- Exported: 2026-03-28T20:00:00.674Z
-- ID: 49e18d1f-089d-482a-81c8-b11f0c8a067a

-- Branch: empty
-- Dealer: empty
-- Product: empty
-- Order: empty
-- Payment: empty
-- Expense: empty
-- User (1 rows)
INSERT INTO "User" ("id", "companyId", "branchId", "phone", "fullName", "roleType", "isActive", "createdAt") VALUES ('baca4a8f-4f48-4e6e-8136-caa015acf033', '49e18d1f-089d-482a-81c8-b11f0c8a067a', NULL, '+998000000000', 'Demo Distributor', 'OWNER', TRUE, '2026-03-28T19:58:28.472Z') ON CONFLICT DO NOTHING;

