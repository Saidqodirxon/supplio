-- Supplio Company Export
-- Company: Supplio System
-- Exported: 2026-04-13T20:00:00.971Z
-- ID: 372dcf39-46c6-4fef-a349-808c82dc8d8a

-- Branch (1 rows)
INSERT INTO "Branch" ("id", "companyId", "name", "address", "phone", "createdAt", "updatedAt", "deletedAt", "deletedBy") VALUES ('b6ee5c42-edfe-4780-85f7-af78b91885c0', '372dcf39-46c6-4fef-a349-808c82dc8d8a', 'Sergeli office', 'Navro''z 29', '+998200116877', '2026-03-28T18:46:21.831Z', '2026-03-28T18:46:21.831Z', NULL, NULL) ON CONFLICT DO NOTHING;

-- Dealer (1 rows)
INSERT INTO "Dealer" ("id", "companyId", "branchId", "name", "phone", "address", "creditLimit", "currentDebt", "telegramChatId", "createdAt", "updatedAt", "deletedAt", "deletedBy", "isApproved", "approvedAt", "approvedBy", "isBlocked", "cashbackBalance") VALUES ('50e3208d-bf6c-4330-9d0f-2c0ef0e6be80', '372dcf39-46c6-4fef-a349-808c82dc8d8a', 'b6ee5c42-edfe-4780-85f7-af78b91885c0', 'Saidqodirxon test', '+998940116877', 'Kindudan', 100000000, 0, '1551855614', '2026-03-28T20:07:31.250Z', '2026-03-31T18:18:52.766Z', NULL, NULL, TRUE, '2026-03-31T18:18:52.764Z', 'abf2f3b6-8458-419c-b7cf-37d134674bf8', FALSE, 0) ON CONFLICT DO NOTHING;

-- Product (1 rows)
INSERT INTO "Product" ("id", "companyId", "name", "sku", "description", "costPrice", "price", "stock", "unit", "createdAt", "updatedAt", "deletedAt", "deletedBy", "categoryId", "imageUrl", "isActive", "subcategoryId", "unitId", "discountPrice", "isPromo") VALUES ('37ee59fd-bb25-43c7-8e51-d0ca8f4593cb', '372dcf39-46c6-4fef-a349-808c82dc8d8a', 'KreazyMax', NULL, 'Ajoyib muzqaymoq', 400, 500, 1000, 'dona', '2026-03-29T09:42:12.205Z', '2026-03-29T09:52:49.222Z', NULL, NULL, '9caad36e-f91c-4af8-924e-42540dcfe0c3', '/uploads/8be7ea24-ce7f-465c-9663-4cd807244dac.jpg', TRUE, 'c63adc41-0bf3-4b66-be2b-32e336af9266', 'ab5c9bd4-8333-4134-a5ed-60d54e62eceb', NULL, FALSE) ON CONFLICT DO NOTHING;

-- Order: empty
-- Payment: empty
-- Expense: empty
-- User (1 rows)
INSERT INTO "User" ("id", "companyId", "branchId", "phone", "fullName", "roleType", "isActive", "createdAt") VALUES ('abf2f3b6-8458-419c-b7cf-37d134674bf8', '372dcf39-46c6-4fef-a349-808c82dc8d8a', NULL, '+998917505060', 'Saidqodirxon', 'SUPER_ADMIN', TRUE, '2026-03-28T18:22:04.302Z') ON CONFLICT DO NOTHING;

