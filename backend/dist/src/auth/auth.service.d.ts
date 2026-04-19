import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
export declare class AuthService {
    private prisma;
    private jwtService;
    private static readonly DEMO_PHONE;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(phone: string, pass: string, isDemoRequest?: boolean): Promise<{
        token: string;
        user: {
            id: string;
            phone: string;
            roleType: import(".prisma/client").$Enums.RoleType;
            companyId: string;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        isActive: boolean;
        phone: string;
        fullName: string;
        photoUrl: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        language: string;
    }>;
    updateProfile(userId: string, data: {
        fullName?: string;
        photoUrl?: string;
        language?: string;
    }): Promise<{
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
    }>;
    changePassword(userId: string, data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
    }>;
    requestPasswordReset(userId: string, data?: {
        note?: string;
    }): Promise<{
        success: boolean;
        alreadyRequested: boolean;
    } | {
        success: boolean;
        alreadyRequested?: undefined;
    }>;
}
