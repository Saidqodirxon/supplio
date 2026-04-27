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
exports.DealersController = void 0;
const common_1 = require("@nestjs/common");
const dealers_service_1 = require("./dealers.service");
const telegram_service_1 = require("../telegram/telegram.service");
const tenant_guard_1 = require("../common/middleware/tenant.guard");
const roles_guard_1 = require("../common/middleware/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let DealersController = class DealersController {
    constructor(dealersService, telegramService) {
        this.dealersService = dealersService;
        this.telegramService = telegramService;
    }
    async create(req, body) {
        return this.dealersService.create(req.companyId, body);
    }
    async findAll(req) {
        return this.dealersService.findAll(req.companyId, req.user);
    }
    async getPendingApprovals(req) {
        return this.dealersService.getPendingApprovals(req.companyId);
    }
    async update(req, id, body) {
        return this.dealersService.update(id, req.companyId, body);
    }
    async remove(req, id) {
        return this.dealersService.remove(id, req.companyId, req.user.id);
    }
    async approve(req, id, body) {
        const result = await this.dealersService.approveDealer(id, req.companyId, req.user.id, body?.creditLimit);
        this.telegramService.notifyDealerApprovalResult(req.companyId, id, true).catch(() => { });
        return result;
    }
    async reject(req, id) {
        const result = await this.dealersService.rejectDealer(id, req.companyId, req.user.id);
        this.telegramService.notifyDealerApprovalResult(req.companyId, id, false).catch(() => { });
        return result;
    }
    async block(req, id) {
        return this.dealersService.block(id, req.companyId);
    }
    async unblock(req, id) {
        return this.dealersService.unblock(id, req.companyId);
    }
    async resetCashback(req, id) {
        return this.dealersService.resetCashback(id, req.companyId);
    }
    async getCashbackSummary(req) {
        return this.dealersService.getCashbackSummary(req.companyId);
    }
};
exports.DealersController = DealersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER", "STAFF"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("pending-approvals"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/approve"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(":id/reject"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(":id/block"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "block", null);
__decorate([
    (0, common_1.Post)(":id/unblock"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "unblock", null);
__decorate([
    (0, common_1.Post)(":id/cashback/reset"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "resetCashback", null);
__decorate([
    (0, common_1.Get)("cashback/summary"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DealersController.prototype, "getCashbackSummary", null);
exports.DealersController = DealersController = __decorate([
    (0, common_1.Controller)("dealers"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [dealers_service_1.DealersService,
        telegram_service_1.TelegramService])
], DealersController);
//# sourceMappingURL=dealers.controller.js.map