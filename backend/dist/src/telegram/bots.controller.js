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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotsController = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./telegram.service");
const company_notifier_service_1 = require("./company-notifier.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_guard_1 = require("../common/middleware/tenant.guard");
const roles_guard_1 = require("../common/middleware/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let BotsController = class BotsController {
    constructor(telegramService, companyNotifier) {
        this.telegramService = telegramService;
        this.companyNotifier = companyNotifier;
    }
    async getBots(req) {
        const bots = await this.telegramService.getBotsForCompany(req.companyId);
        return bots.map((b) => ({
            ...b,
            status: this.telegramService.getBotStatus(b.id),
        }));
    }
    async validateToken(body) {
        return this.telegramService.validateToken(body.token);
    }
    async getBotStatus(req) {
        const bots = await this.telegramService.getBotsForCompany(req.companyId);
        const firstBot = bots.find((b) => b.isActive);
        if (!firstBot)
            return { status: "not_found" };
        return { status: this.telegramService.getBotStatus(firstBot.id) };
    }
    async createBot(req, body) {
        return this.telegramService.createBot(req.companyId, body);
    }
    async updateBot(req, id, body) {
        return this.telegramService.updateBot(id, req.companyId, body);
    }
    async removeBot(req, id) {
        return this.telegramService.removeBot(id, req.companyId);
    }
    async broadcast(req, body) {
        return this.telegramService.broadcast(req.companyId, body.message);
    }
    async reloadBots(req) {
        return this.telegramService.reloadCompanyBots(req.companyId);
    }
    async applyBotBranding(req, id) {
        const bots = await this.telegramService.getBotsForCompany(req.companyId);
        const bot = bots.find((b) => b.id === id);
        if (!bot)
            return { error: "Bot not found" };
        return this.telegramService.applyBotBranding(bot.token, req.companyId);
    }
    async adminCreateBot(body) {
        return this.telegramService.createBot(body.companyId, {
            token: body.token,
            botName: body.botName,
            description: body.description,
        });
    }
    async testGroup(req, type) {
        return this.companyNotifier.testGroup(req.companyId, type);
    }
    async sendManualReport(req) {
        await this.companyNotifier.sendDailyReport(req.companyId);
        return { ok: true };
    }
    async getAllBotsAdmin() {
        return this.telegramService.getAllBotsAdmin();
    }
    async adminReloadAllBots() {
        return this.telegramService.adminReloadAllBots();
    }
    async adminReloadBot(id) {
        return this.telegramService.adminReloadBot(id);
    }
    async adminUpdateBot(id, body) {
        return this.telegramService.adminUpdateBot(id, body);
    }
    async adminDeleteAllBots() {
        return this.telegramService.adminDeleteAllBots();
    }
    async adminHardDeleteBot(id) {
        return this.telegramService.adminHardDeleteBot(id);
    }
};
exports.BotsController = BotsController;
__decorate([
    (0, common_1.Get)("bots"),
    (0, roles_decorator_1.Roles)("OWNER", "MANAGER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "getBots", null);
__decorate([
    (0, common_1.Post)("bots/validate"),
    (0, roles_decorator_1.Roles)("OWNER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Get)("bots/status"),
    (0, roles_decorator_1.Roles)("OWNER", "MANAGER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "getBotStatus", null);
__decorate([
    (0, common_1.Post)("bots"),
    (0, roles_decorator_1.Roles)("OWNER", "MANAGER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "createBot", null);
__decorate([
    (0, common_1.Patch)("bots/:id"),
    (0, roles_decorator_1.Roles)("OWNER", "MANAGER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "updateBot", null);
__decorate([
    (0, common_1.Delete)("bots/:id"),
    (0, roles_decorator_1.Roles)("OWNER", "MANAGER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "removeBot", null);
__decorate([
    (0, common_1.Post)("broadcast"),
    (0, roles_decorator_1.Roles)("OWNER", "MANAGER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "broadcast", null);
__decorate([
    (0, common_1.Post)("bots/reload"),
    (0, roles_decorator_1.Roles)("OWNER", "MANAGER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "reloadBots", null);
__decorate([
    (0, common_1.Post)("bots/:id/branding"),
    (0, roles_decorator_1.Roles)("OWNER", "MANAGER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "applyBotBranding", null);
__decorate([
    (0, common_1.Post)("admin/bots"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "adminCreateBot", null);
__decorate([
    (0, common_1.Post)("groups/test/:type"),
    (0, roles_decorator_1.Roles)("OWNER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "testGroup", null);
__decorate([
    (0, common_1.Post)("groups/report"),
    (0, roles_decorator_1.Roles)("OWNER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "sendManualReport", null);
__decorate([
    (0, common_1.Get)("admin/bots"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "getAllBotsAdmin", null);
__decorate([
    (0, common_1.Post)("admin/bots/reload-all"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "adminReloadAllBots", null);
__decorate([
    (0, common_1.Post)("admin/bots/:id/reload"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "adminReloadBot", null);
__decorate([
    (0, common_1.Patch)("admin/bots/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "adminUpdateBot", null);
__decorate([
    (0, common_1.Delete)("admin/bots/all"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "adminDeleteAllBots", null);
__decorate([
    (0, common_1.Delete)("admin/bots/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotsController.prototype, "adminHardDeleteBot", null);
exports.BotsController = BotsController = __decorate([
    (0, common_1.Controller)("telegram"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService,
        company_notifier_service_1.CompanyNotifierService])
], BotsController);
//# sourceMappingURL=bots.controller.js.map