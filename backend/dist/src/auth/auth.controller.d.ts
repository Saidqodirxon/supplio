import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: {
        headers?: Record<string, string>;
    }): Promise<{
        token: string;
        user: {
            id: string;
            phone: string;
            roleType: import(".prisma/client").$Enums.RoleType;
            companyId: string;
        };
    }>;
    getProfile(req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        isActive: boolean;
        phone: string;
        fullName: string;
        photoUrl: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        language: string;
    }>;
    updateProfile(req: {
        user: {
            id: string;
        };
    }, body: {
        fullName?: string;
        photoUrl?: string;
        language?: string;
    }): Promise<{
        id: string;
        companyId: string;
        isActive: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        deletedBy: string | null;
        phone: string;
        branchId: string | null;
        passwordHash: string;
        fullName: string | null;
        photoUrl: string | null;
        roleType: import(".prisma/client").$Enums.RoleType;
        language: string;
        customRoleId: string | null;
    }>;
    changePassword(req: {
        user: {
            id: string;
        };
    }, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
    }>;
    requestPasswordReset(req: {
        user: {
            id: string;
        };
    }, body?: {
        note?: string;
    }): Promise<{
        success: boolean;
        alreadyRequested: boolean;
    } | {
        success: boolean;
        alreadyRequested?: undefined;
    }>;
}
