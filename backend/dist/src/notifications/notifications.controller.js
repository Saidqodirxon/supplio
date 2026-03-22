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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_guard_1 = require("../common/middleware/tenant.guard");
let NotificationsController = class NotificationsController {
    constructor(notifService) {
        this.notifService = notifService;
    }
    async getMyNotifications(req, page, limit) {
        return this.notifService.getUserNotifications(req.user.id, req.companyId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
    }
    async getUnreadCount(req) {
        const count = await this.notifService.getUnreadCount(req.user.id, req.companyId);
        return { count };
    }
    async markAsRead(id, req) {
        await this.notifService.markAsRead(id, req.user.id);
        return { success: true };
    }
    async markAllAsRead(req) {
        await this.notifService.markAllAsRead(req.user.id, req.companyId);
        return { success: true };
    }
    async createNotification(req, body) {
        if (body.receiverDealerId) {
            return this.notifService.createForDealer({
                companyId: req.companyId,
                senderId: req.user.id,
                receiverDealerId: body.receiverDealerId,
                title: body.title,
                message: body.message,
                type: body.type,
            });
        }
        return this.notifService.broadcastToCompany({
            companyId: req.companyId,
            senderId: req.user.id,
            title: body.title,
            message: body.message,
            type: body.type,
        });
    }
    async sendToUser(req, body) {
        return this.notifService.createForUser({
            companyId: req.companyId,
            senderId: req.user.id,
            receiverUserId: body.receiverUserId,
            title: body.title,
            message: body.message,
            type: body.type,
        });
    }
    async broadcast(req, body) {
        return this.notifService.broadcastToCompany({
            companyId: req.companyId,
            senderId: req.user.id,
            title: body.title,
            message: body.message,
            type: body.type,
        });
    }
    async getTemplates(req) {
        return this.notifService.getTemplates(req.companyId);
    }
    async createTemplate(req, body) {
        return this.notifService.createTemplate(req.companyId, body);
    }
    async updateTemplate(req, id, body) {
        return this.notifService.updateTemplate(req.companyId, id, body);
    }
    async deleteTemplate(req, id) {
        return this.notifService.deleteTemplate(req.companyId, id);
    }
    async getTemplateLogs(req, templateId) {
        return this.notifService.getTemplateLogs(req.companyId, templateId);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getMyNotifications", null);
__decorate([
    (0, common_1.Get)("unread-count"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(":id/read"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)("read-all"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Post)("send"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendToUser", null);
__decorate([
    (0, common_1.Post)("broadcast"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "broadcast", null);
__decorate([
    (0, common_1.Get)("templates"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)("templates"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Patch)("templates/:id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)("templates/:id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Get)("templates/logs"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("templateId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getTemplateLogs", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)("notifications"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map