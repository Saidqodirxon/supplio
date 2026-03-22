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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/middleware/roles.guard");
const tenant_guard_1 = require("../common/middleware/tenant.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getDashboardStats(req, period) {
        const companyId = req.companyId || req.user.companyId;
        const p = (["7d", "30d", "1y", "all"].includes(period ?? "") ? period : "7d");
        return this.analyticsService.getDashboardStats(companyId, p);
    }
    async getTopDealers(req, limit) {
        const companyId = req.companyId || req.user.companyId;
        return this.analyticsService.getTopDealers(companyId, limit ? Number(limit) : 5);
    }
    async getTopProducts(req, limit) {
        const companyId = req.companyId || req.user.companyId;
        return this.analyticsService.getTopProducts(companyId, limit ? Number(limit) : 5);
    }
    async getDebtReport(req) {
        const companyId = req.companyId || req.user.companyId;
        return this.analyticsService.getDebtReport(companyId);
    }
    async getRootStats() {
        return this.analyticsService.getSuperAdminGlobalStats();
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)("dashboard"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER", "SALES"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("period")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)("top-dealers"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopDealers", null);
__decorate([
    (0, common_1.Get)("top-products"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER", "SALES"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.Get)("debts"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER", "SALES"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDebtReport", null);
__decorate([
    (0, common_1.Get)("root"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRootStats", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)("analytics"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map