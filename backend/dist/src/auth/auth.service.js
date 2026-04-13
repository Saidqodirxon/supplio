"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(phone, pass, isDemoRequest = false) {
        if (isDemoRequest && phone !== AuthService_1.DEMO_PHONE) {
            throw new common_1.UnauthorizedException(`Demo rejimda faqat ${AuthService_1.DEMO_PHONE} bilan kirish mumkin`);
        }
        const user = await this.prisma.user.findUnique({
            where: { phone },
            include: {
                company: {
                    select: { subscriptionStatus: true, trialExpiresAt: true },
                },
            },
        });
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            if (!user.isActive) {
                throw new common_1.UnauthorizedException("User is deactivated");
            }
            const companyExpired = !!user.company?.trialExpiresAt &&
                ["TRIAL", "ACTIVE"].includes(String(user.company?.subscriptionStatus || "")) &&
                new Date() > new Date(user.company.trialExpiresAt);
            if (user.roleType !== "SUPER_ADMIN" &&
                (user.company?.subscriptionStatus === "LOCKED" || companyExpired)) {
                throw new common_1.UnauthorizedException("Subscription expired or account locked");
            }
            const payload = {
                sub: user.id,
                phone: user.phone,
                companyId: user.companyId,
                branchId: user.branchId,
                roleType: user.roleType,
            };
            return {
                token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    phone: user.phone,
                    roleType: user.roleType,
                    companyId: user.companyId,
                },
            };
        }
        throw new common_1.UnauthorizedException("Invalid credentials");
    }
    async getProfile(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                phone: true,
                photoUrl: true,
                roleType: true,
                isActive: true,
                language: true,
            },
        });
    }
    async updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                fullName: data.fullName,
                photoUrl: data.photoUrl,
                language: data.language,
            },
        });
    }
    async changePassword(userId, data) {
        if (!data.currentPassword || !data.newPassword) {
            throw new common_1.BadRequestException("Both current and new passwords are required");
        }
        if (data.newPassword.length < 6) {
            throw new common_1.BadRequestException("New password must be at least 6 characters");
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, passwordHash: true },
        });
        if (!user ||
            !(await bcrypt.compare(data.currentPassword, user.passwordHash))) {
            throw new common_1.UnauthorizedException("Current password is incorrect");
        }
        const passwordHash = await bcrypt.hash(data.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { success: true };
    }
    async requestPasswordReset(userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { company: { select: { name: true, slug: true } } },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("User not found");
        }
        const existing = await this.prisma.lead.findFirst({
            where: {
                phone: user.phone,
                status: "NEW",
                info: { contains: "PASSWORD_RESET_REQUEST" },
            },
        });
        if (existing) {
            return { success: true, alreadyRequested: true };
        }
        const infoLines = [
            "PASSWORD_RESET_REQUEST",
            `Company: ${user.company?.name || "-"}`,
            `Slug: ${user.company?.slug || "-"}`,
            `User: ${user.fullName || user.phone}`,
            `Role: ${user.roleType}`,
        ];
        if (data?.note?.trim()) {
            infoLines.push(`Note: ${data.note.trim()}`);
        }
        await this.prisma.lead.create({
            data: {
                fullName: user.fullName || `Password reset request`,
                phone: user.phone,
                info: infoLines.join(" | "),
            },
        });
        return { success: true };
    }
};
exports.AuthService = AuthService;
AuthService.DEMO_PHONE = "+998901000000";
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map