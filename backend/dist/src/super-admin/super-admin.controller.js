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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const super_admin_service_1 = require("./super-admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/middleware/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const backup_service_1 = require("../common/services/backup/backup.service");
const units_service_1 = require("../units/units.service");
const fs_1 = require("fs");
let SuperAdminController = class SuperAdminController {
    constructor(superAdminService, backupService, unitsService) {
        this.superAdminService = superAdminService;
        this.backupService = backupService;
        this.unitsService = unitsService;
    }
    async getBackups() {
        return this.backupService.listBackups();
    }
    async triggerBackup() {
        return this.backupService.createBackup();
    }
    async sendBackupToTelegram() {
        return this.backupService.createBackupAndSend();
    }
    async triggerCompanyBackup(companyId) {
        return this.backupService.createCompanyBackup(companyId);
    }
    async sendCompanyBackupToTelegram(companyId) {
        return this.backupService.createCompanyBackupAndSend(companyId);
    }
    async downloadBackup(name, res) {
        try {
            const filePath = this.backupService.resolveBackupPath(name);
            res.setHeader("Content-Type", "application/octet-stream");
            res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(name)}"`);
            return new common_1.StreamableFile((0, fs_1.createReadStream)(filePath));
        }
        catch {
            throw new common_1.NotFoundException("Backup file not found");
        }
    }
    async getSettings() {
        return this.superAdminService.getGlobalSettings();
    }
    async updateSettings(body) {
        return this.superAdminService.updateGlobalSettings(body);
    }
    async directUpdate(body) {
        return this.superAdminService.directUpdate(body.model, body.id, body.field, body.value);
    }
    async fixUsers() {
        return this.superAdminService.fixUsers();
    }
    async getCompanies(search, plan, status, page, limit) {
        return this.superAdminService.getAllCompanies({
            search,
            plan,
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }
    async getCompany(id) {
        return this.superAdminService.getCompanyById(id);
    }
    async updateCompany(id, body) {
        return this.superAdminService.updateCompany(id, body);
    }
    async deleteCompany(id, req) {
        return this.superAdminService.deleteCompany(id, req.user.id);
    }
    async setCompanyPlan(id, body) {
        return this.superAdminService.setCompanyPlan(id, body.plan, body.status);
    }
    async setCompanyStatus(id, body) {
        return this.superAdminService.setCompanyStatus(id, body.status);
    }
    async getNews() {
        return this.superAdminService.getAllNews();
    }
    async createNews(req, body) {
        return this.superAdminService.createNews(req.user.id, body);
    }
    async updateNews(id, body) {
        return this.superAdminService.updateNews(id, body);
    }
    async deleteNews(id) {
        return this.superAdminService.deleteNews(id);
    }
    async seedNews() {
        return this.superAdminService.seedNews();
    }
    async broadcast(body) {
        return this.superAdminService.broadcast(body);
    }
    async getDistributors(search, status, page, limit) {
        return this.superAdminService.getDistributors({
            search,
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }
    async createDistributor(body) {
        return this.superAdminService.createDistributor(body);
    }
    async resetDistributorOwnerPassword(id, body) {
        return this.superAdminService.resetDistributorOwnerPassword(id, body.password);
    }
    async notifyDistributors(body) {
        return this.superAdminService.notifyDistributors(body);
    }
    async getTariffs() {
        return this.superAdminService.getAllTariffs();
    }
    async createTariff(body) {
        return this.superAdminService.createTariff(body);
    }
    async updateTariff(id, body) {
        return this.superAdminService.updateTariff(id, body);
    }
    async deleteTariff(id) {
        return this.superAdminService.deleteTariff(id);
    }
    async seedTariffs() {
        return this.superAdminService.seedDefaultTariffs();
    }
    async seedUnits() {
        await this.unitsService.seedDefaults();
        return { message: "Default units seeded" };
    }
    async getAuditLogs(page, limit, userId) {
        return this.superAdminService.getAuditLogs({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 50,
            userId,
        });
    }
    async getLeads(status, search, page, limit) {
        return this.superAdminService.getLeads({
            status,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }
    async updateLead(id, body) {
        return this.superAdminService.updateLead(id, body);
    }
    async deleteLead(id) {
        return this.superAdminService.deleteLead(id);
    }
    async getFeatures() {
        return this.superAdminService.getAllFeatures();
    }
    async toggleFeature(body) {
        return this.superAdminService.setFeature(body);
    }
    async getLandingContent() {
        return this.superAdminService.getLandingContent();
    }
    async updateLandingContent(body) {
        return this.superAdminService.updateLandingContent(body);
    }
    async getMetrics() {
        return this.superAdminService.getServerMetrics();
    }
    async getReleaseNotes() {
        return this.superAdminService.getReleaseNotes();
    }
    async createReleaseNote(body) {
        return this.superAdminService.createReleaseNote(body);
    }
    async deleteReleaseNote(id) {
        return this.superAdminService.deleteReleaseNote(id);
    }
    async createUpgradeRequest(body, req) {
        return this.superAdminService.createUpgradeRequest(req.user.companyId, body);
    }
    async getUpgradeRequests() {
        return this.superAdminService.getUpgradeRequests();
    }
    async updateUpgradeRequest(id, body) {
        return this.superAdminService.updateUpgradeRequest(id, body);
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)("backups"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getBackups", null);
__decorate([
    (0, common_1.Post)("backups/trigger"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "triggerBackup", null);
__decorate([
    (0, common_1.Post)("backups/send"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "sendBackupToTelegram", null);
__decorate([
    (0, common_1.Post)("backups/company/:companyId/trigger"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "triggerCompanyBackup", null);
__decorate([
    (0, common_1.Post)("backups/company/:companyId/send"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "sendCompanyBackupToTelegram", null);
__decorate([
    (0, common_1.Get)("backups/download"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Query)("name")),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "downloadBackup", null);
__decorate([
    (0, common_1.Get)("settings"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)("settings"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)("patch-data"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "directUpdate", null);
__decorate([
    (0, common_1.Post)("fix-users"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "fixUsers", null);
__decorate([
    (0, common_1.Get)("companies"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("plan")),
    __param(2, (0, common_1.Query)("status")),
    __param(3, (0, common_1.Query)("page")),
    __param(4, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getCompanies", null);
__decorate([
    (0, common_1.Get)("companies/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getCompany", null);
__decorate([
    (0, common_1.Patch)("companies/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateCompany", null);
__decorate([
    (0, common_1.Delete)("companies/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "deleteCompany", null);
__decorate([
    (0, common_1.Patch)("companies/:id/plan"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "setCompanyPlan", null);
__decorate([
    (0, common_1.Patch)("company/:id/status"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "setCompanyStatus", null);
__decorate([
    (0, common_1.Get)("news"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getNews", null);
__decorate([
    (0, common_1.Post)("news"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createNews", null);
__decorate([
    (0, common_1.Patch)("news/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateNews", null);
__decorate([
    (0, common_1.Delete)("news/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "deleteNews", null);
__decorate([
    (0, common_1.Post)("news/seed"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "seedNews", null);
__decorate([
    (0, common_1.Post)("broadcast"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "broadcast", null);
__decorate([
    (0, common_1.Get)("distributors"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("status")),
    __param(2, (0, common_1.Query)("page")),
    __param(3, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getDistributors", null);
__decorate([
    (0, common_1.Post)("distributors"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createDistributor", null);
__decorate([
    (0, common_1.Patch)("distributors/:id/owner-password"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "resetDistributorOwnerPassword", null);
__decorate([
    (0, common_1.Post)("notify-distributors"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "notifyDistributors", null);
__decorate([
    (0, common_1.Get)("tariffs"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getTariffs", null);
__decorate([
    (0, common_1.Post)("tariffs"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createTariff", null);
__decorate([
    (0, common_1.Patch)("tariffs/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateTariff", null);
__decorate([
    (0, common_1.Delete)("tariffs/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "deleteTariff", null);
__decorate([
    (0, common_1.Post)("tariffs/seed"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "seedTariffs", null);
__decorate([
    (0, common_1.Post)("units/seed"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "seedUnits", null);
__decorate([
    (0, common_1.Get)("audit-logs"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)("leads"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Query)("status")),
    __param(1, (0, common_1.Query)("search")),
    __param(2, (0, common_1.Query)("page")),
    __param(3, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getLeads", null);
__decorate([
    (0, common_1.Patch)("leads/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateLead", null);
__decorate([
    (0, common_1.Delete)("leads/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "deleteLead", null);
__decorate([
    (0, common_1.Get)("features"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getFeatures", null);
__decorate([
    (0, common_1.Post)("features"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "toggleFeature", null);
__decorate([
    (0, common_1.Get)("landing"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getLandingContent", null);
__decorate([
    (0, common_1.Patch)("landing"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateLandingContent", null);
__decorate([
    (0, common_1.Get)("metrics"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)("release-notes"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getReleaseNotes", null);
__decorate([
    (0, common_1.Post)("release-notes"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createReleaseNote", null);
__decorate([
    (0, common_1.Delete)("release-notes/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "deleteReleaseNote", null);
__decorate([
    (0, common_1.Post)("upgrade-requests"),
    (0, roles_decorator_1.Roles)("OWNER", "MANAGER", "SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createUpgradeRequest", null);
__decorate([
    (0, common_1.Get)("upgrade-requests"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getUpgradeRequests", null);
__decorate([
    (0, common_1.Patch)("upgrade-requests/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateUpgradeRequest", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)("super"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [super_admin_service_1.SuperAdminService,
        backup_service_1.BackupService,
        units_service_1.UnitsService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map