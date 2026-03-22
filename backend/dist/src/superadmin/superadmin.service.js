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
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SuperAdminService = class SuperAdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGlobalSettings() {
        return this.prisma.systemSettings.upsert({
            where: { id: "GLOBAL" },
            update: {},
            create: {
                superAdminPhone: "+998901112233",
                defaultTrialDays: 14,
            },
        });
    }
    async updateGlobalSettings(data) {
        return this.prisma.systemSettings.update({
            where: { id: "GLOBAL" },
            data,
        });
    }
    async getAllNews() {
        return this.prisma.news.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async createNews(authorId, data) {
        return this.prisma.news.create({
            data: {
                ...data,
                authorId,
            },
        });
    }
    async updateNews(id, data) {
        return this.prisma.news.update({
            where: { id },
            data,
        });
    }
    async deleteNews(id) {
        return this.prisma.news.delete({
            where: { id },
        });
    }
    async directUpdate(model, id, field, value) {
        const data = {};
        let parsedValue = value;
        if (value === "true")
            parsedValue = true;
        if (value === "false")
            parsedValue = false;
        if (!isNaN(Number(value)) && value.trim() !== "")
            parsedValue = Number(value);
        data[field] = parsedValue;
        return this.prisma[model.toLowerCase()].update({
            where: { id },
            data,
        });
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuperAdminService);
//# sourceMappingURL=superadmin.service.js.map