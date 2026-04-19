import { PrismaService } from "../../prisma/prisma.service";
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(payload: {
        userId?: string;
        action: string;
        resource?: string;
        metadata?: any;
        ip?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        resource: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ip: string | null;
        userId: string | null;
    }>;
    getLogs(filters: {
        userId?: string;
        action?: string;
        limit?: number;
    }): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            isActive: boolean;
            branchId: string | null;
            phone: string;
            passwordHash: string;
            fullName: string | null;
            photoUrl: string | null;
            roleType: import(".prisma/client").$Enums.RoleType;
            customRoleId: string | null;
            language: string;
        };
    } & {
        id: string;
        createdAt: Date;
        action: string;
        resource: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ip: string | null;
        userId: string | null;
    })[]>;
}
