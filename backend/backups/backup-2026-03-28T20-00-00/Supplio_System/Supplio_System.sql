-- Supplio Company Export
-- Company: Supplio System
-- Exported: 2026-03-28T20:00:00.665Z
-- ID: 372dcf39-46c6-4fef-a349-808c82dc8d8a

-- Branch (1 rows)
INSERT INTO "Branch" ("id", "companyId", "name", "address", "phone", "createdAt", "updatedAt", "deletedAt", "deletedBy") VALUES ('b6ee5c42-edfe-4780-85f7-af78b91885c0', '372dcf39-46c6-4fef-a349-808c82dc8d8a', 'Sergeli office', 'Navro''z 29', '+998200116877', '2026-03-28T18:46:21.831Z', '2026-03-28T18:46:21.831Z', NULL, NULL) ON CONFLICT DO NOTHING;

-- Dealer: empty
-- Product: empty
-- Order: empty
-- Payment: empty
-- Expense: empty
-- User (1 rows)
INSERT INTO "User" ("id", "companyId", "branchId", "phone", "fullName", "roleType", "isActive", "createdAt") VALUES ('abf2f3b6-8458-419c-b7cf-37d134674bf8', '372dcf39-46c6-4fef-a349-808c82dc8d8a', NULL, '+998917505060', 'Super Admin', 'SUPER_ADMIN', TRUE, '2026-03-28T18:22:04.302Z') ON CONFLICT DO NOTHING;

