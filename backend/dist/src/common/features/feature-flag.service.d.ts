import { PrismaService } from "../../prisma/prisma.service";
export declare class FeatureFlagService {
    private prisma;
    constructor(prisma: PrismaService);
    isEnabled(companyId: string, featureKey: string): Promise<boolean>;
    private _matchesPlan;
}
