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
var LeadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_logger_service_1 = require("../telegram/telegram-logger.service");
let LeadsService = LeadsService_1 = class LeadsService {
    constructor(prisma, telegramLogger) {
        this.prisma = prisma;
        this.telegramLogger = telegramLogger;
        this.logger = new common_1.Logger(LeadsService_1.name);
    }
    async createLead(data) {
        const lead = await this.prisma.lead.create({
            data: {
                fullName: data.fullName,
                phone: data.phone,
                info: data.info,
            },
        });
        this.telegramLogger.sendLeadNotification(lead).catch(() => { });
        return lead;
    }
    async getAllLeads() {
        return this.prisma.lead.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async updateLeadStatus(id, status) {
        return this.prisma.lead.update({
            where: { id },
            data: { status },
        });
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = LeadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_logger_service_1.TelegramLoggerService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map