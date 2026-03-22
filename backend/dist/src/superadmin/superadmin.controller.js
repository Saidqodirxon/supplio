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
const superadmin_service_1 = require("./superadmin.service");
const superadmin_guard_1 = require("./superadmin.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SuperAdminController = class SuperAdminController {
    constructor(superService) {
        this.superService = superService;
    }
    getSettings() {
        return this.superService.getGlobalSettings();
    }
    updateSettings(data) {
        return this.superService.updateGlobalSettings(data);
    }
    getNews() {
        return this.superService.getAllNews();
    }
    createNews(req, data) {
        return this.superService.createNews(req.user.id, data);
    }
    updateNews(id, data) {
        return this.superService.updateNews(id, data);
    }
    deleteNews(id) {
        return this.superService.deleteNews(id);
    }
    directUpdate(body) {
        return this.superService.directUpdate(body.model, body.id, body.field, body.value);
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)("settings"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)("settings"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)("news"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getNews", null);
__decorate([
    (0, common_1.Post)("news"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "createNews", null);
__decorate([
    (0, common_1.Patch)("news/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateNews", null);
__decorate([
    (0, common_1.Delete)("news/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "deleteNews", null);
__decorate([
    (0, common_1.Patch)("direct-update"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "directUpdate", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)("super"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, superadmin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [superadmin_service_1.SuperAdminService])
], SuperAdminController);
//# sourceMappingURL=superadmin.controller.js.map