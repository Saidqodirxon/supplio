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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicService = class PublicService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async loadGlobalSettings() {
        try {
            const rows = await this.prisma.$queryRawUnsafe(`SELECT
          "newsEnabled",
          "systemVersion",
          "maintenanceMode",
          "superAdminPhone",
          "termsUz",
          "termsRu",
          "termsEn",
          "termsUzCyr",
          "privacyUz",
          "privacyRu",
          "privacyEn",
          "privacyUzCyr",
          "contractUz",
          "contractRu",
          "contractEn",
          "contractUzCyr",
          "updatedAt"
        FROM "SystemSettings"
        WHERE id = 'GLOBAL'
        LIMIT 1`);
            return rows[0] ?? null;
        }
        catch {
            return null;
        }
    }
    async getHomeData() {
        const [news, tariffs, settings, landing] = await Promise.all([
            this.prisma.news.findMany({
                where: { isPublished: true },
                orderBy: { createdAt: "desc" },
                take: 4,
                select: {
                    id: true,
                    slugUz: true,
                    slugRu: true,
                    slugEn: true,
                    slugTr: true,
                    slugUzCyr: true,
                    titleUz: true,
                    titleRu: true,
                    titleEn: true,
                    titleTr: true,
                    titleUzCyr: true,
                    excerptUz: true,
                    excerptRu: true,
                    excerptEn: true,
                    excerptTr: true,
                    excerptUzCyr: true,
                    image: true,
                    createdAt: true,
                },
            }),
            this.prisma.tariffPlan.findMany({
                where: { isActive: true },
                orderBy: { order: "asc" },
            }),
            this.loadGlobalSettings(),
            this.prisma.landingContent
                .findUnique({ where: { id: "LANDING" } })
                .catch(() => null),
        ]);
        return { news, tariffs, settings, landing };
    }
    async getNewsList(_lang, limit = 20) {
        const take = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20;
        return this.prisma.news.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: "desc" },
            take,
            select: {
                id: true,
                slugUz: true,
                slugRu: true,
                slugEn: true,
                slugTr: true,
                slugUzCyr: true,
                titleUz: true,
                titleRu: true,
                titleEn: true,
                titleTr: true,
                titleUzCyr: true,
                excerptUz: true,
                excerptRu: true,
                excerptEn: true,
                excerptTr: true,
                excerptUzCyr: true,
                image: true,
                createdAt: true,
                viewCount: true,
            },
        });
    }
    async getTariffs() {
        return this.prisma.tariffPlan.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" },
        });
    }
    async getContent() {
        let testimonials = [];
        let companies = 0;
        let orders = 0;
        try {
            const rows = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM "Testimonial" WHERE "isActive" = true`);
            testimonials = await this.prisma.$queryRawUnsafe(`SELECT id, name, company, "roleTitle", "contentUz", "contentRu", "contentEn", "contentTr", rating, avatar, "order" FROM "Testimonial" WHERE "isActive" = true ORDER BY "order" ASC`);
        }
        catch (_e) {
            testimonials = [];
        }
        try {
            const r1 = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM "Company" WHERE "deletedAt" IS NULL`);
            companies = Number(r1[0]?.cnt ?? 0);
        }
        catch (_e) {
            companies = 0;
        }
        try {
            const r2 = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM "Order"`);
            orders = Number(r2[0]?.cnt ?? 0);
        }
        catch (_e) {
            orders = 0;
        }
        let teamMembers = [];
        try {
            teamMembers = await this.prisma.$queryRawUnsafe(`SELECT id, name, "roleUz", "roleRu", "roleEn", "roleTr", "bioUz", "bioRu", "bioEn", "bioTr", avatar, "order" FROM "TeamMember" WHERE "isActive" = true ORDER BY "order" ASC`);
        }
        catch (_e) {
            teamMembers = [];
        }
        return {
            testimonials,
            teamMembers,
            stats: {
                companies,
                orders,
                uptime: "99.9%",
                support: "24/7",
            },
        };
    }
    async getNewsBySlug(slug, lang) {
        const suffix = lang === "oz" ? "UzCyr" : lang.charAt(0).toUpperCase() + lang.slice(1);
        const slugField = `slug${suffix}`;
        return this.prisma.news.findFirst({
            where: {
                [slugField]: slug,
                isPublished: true,
            },
            select: {
                id: true,
                slugUz: true,
                slugRu: true,
                slugEn: true,
                slugTr: true,
                slugUzCyr: true,
                titleUz: true,
                titleRu: true,
                titleEn: true,
                titleTr: true,
                titleUzCyr: true,
                excerptUz: true,
                excerptRu: true,
                excerptEn: true,
                excerptTr: true,
                excerptUzCyr: true,
                contentUz: true,
                contentRu: true,
                contentEn: true,
                contentTr: true,
                contentUzCyr: true,
                image: true,
                viewCount: true,
                isPublished: true,
                createdAt: true,
            },
        });
    }
    async getLegalContent(type, lang) {
        const suffix = lang === "oz" ? "UzCyr" : lang.charAt(0).toUpperCase() + lang.slice(1);
        const field = `${type}${suffix}`;
        const settings = await this.loadGlobalSettings();
        if (!settings) {
            return { type, lang, content: "", updatedAt: null };
        }
        const settingsRecord = settings;
        const getStringField = (key) => {
            const value = settingsRecord[key];
            return typeof value === "string" ? value : undefined;
        };
        const content = getStringField(field) ||
            getStringField(`${type}En`) ||
            getStringField(`${type}Uz`);
        return {
            type,
            lang,
            content: typeof content === "string" ? content : "",
            updatedAt: settings.updatedAt,
        };
    }
    async incrementNewsView(id) {
        try {
            return await this.prisma.news.update({
                where: { id },
                data: { viewCount: { increment: 1 } },
                select: { id: true, viewCount: true },
            });
        }
        catch {
            return { id, viewCount: 0 };
        }
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicService);
//# sourceMappingURL=public.service.js.map