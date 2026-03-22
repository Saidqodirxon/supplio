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
        ip: string | null;
        action: string;
        userId: string | null;
        resource: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getLogs(filters: {
        userId?: string;
        action?: string;
        limit?: number;
    }): Promise<({
        user: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            phone: string;
            companyId: string;
            branchId: string | null;
            isActive: boolean;
            passwordHash: string;
            fullName: string | null;
            photoUrl: string | null;
            roleType: import(".prisma/client").$Enums.RoleType;
            language: string;
            customRoleId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        ip: string | null;
        action: string;
        userId: string | null;
        resource: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
