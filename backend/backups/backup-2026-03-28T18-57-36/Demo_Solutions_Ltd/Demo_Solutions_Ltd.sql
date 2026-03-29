-- Supplio Company Export
-- Company: Demo Solutions Ltd
-- Exported: 2026-03-28T18:57:36.613Z
-- ID: 677fe634-603d-4723-8c85-afff22b41391

-- Branch (1 rows)
INSERT INTO "Branch" ("id", "companyId", "name", "address", "phone", "createdAt", "updatedAt", "deletedAt", "deletedBy") VALUES ('17c263ab-70a9-4bdd-a67f-d8cb8e330972', '677fe634-603d-4723-8c85-afff22b41391', 'Demo Hub', NULL, NULL, '2026-03-28T18:21:44.894Z', '2026-03-28T18:21:44.894Z', NULL, NULL) ON CONFLICT DO NOTHING;

-- Dealer: empty
-- Product: empty
-- Order: empty
-- Payment: empty
-- Expense: empty
-- User (1 rows)
INSERT INTO "User" ("id", "companyId", "branchId", "phone", "fullName", "roleType", "isActive", "createdAt") VALUES ('99cfe604-cdee-4048-a231-32c13319c327', '677fe634-603d-4723-8c85-afff22b41391', '17c263ab-70a9-4bdd-a67f-d8cb8e330972', '+998991112233', 'Demo Owner', 'OWNER', TRUE, '2026-03-28T18:21:44.895Z') ON CONFLICT DO NOTHING;

