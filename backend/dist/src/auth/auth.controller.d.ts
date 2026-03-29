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
        phone: string;
        fullName: string;
        photoUrl: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        isActive: boolean;
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
        phone: string;
        companyId: string;
        branchId: string | null;
        passwordHash: string;
        fullName: string | null;
        photoUrl: string | null;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRoleId: string | null;
        isActive: boolean;
        language: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
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
