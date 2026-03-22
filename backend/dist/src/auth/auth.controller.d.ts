import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
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
        isActive: boolean;
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
    }>;
}
