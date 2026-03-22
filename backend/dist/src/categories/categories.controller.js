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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const categories_service_1 = require("./categories.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_guard_1 = require("../common/middleware/tenant.guard");
const roles_guard_1 = require("../common/middleware/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let CategoriesController = class CategoriesController {
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async findAll(req) {
        return this.categoriesService.findAllCategories(req.companyId);
    }
    async create(req, name) {
        return this.categoriesService.createCategory(req.companyId, name);
    }
    async update(req, id, name) {
        return this.categoriesService.updateCategory(id, req.companyId, name);
    }
    async remove(req, id) {
        return this.categoriesService.removeCategory(id, req.companyId, req.user?.id || "system");
    }
    async restore(req, id) {
        return this.categoriesService.restoreCategory(id, req.companyId);
    }
    async createSubcategory(req, categoryId, name) {
        return this.categoriesService.createSubcategory(req.companyId, categoryId, name);
    }
    async updateSubcategory(req, id, body) {
        return this.categoriesService.updateSubcategory(id, req.companyId, body);
    }
    async removeSubcategory(req, id) {
        return this.categoriesService.removeSubcategory(id, req.companyId, req.user?.id || "system");
    }
    async restoreSubcategory(req, id) {
        return this.categoriesService.restoreSubcategory(id, req.companyId);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(":id/restore"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)(":categoryId/subcategories"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("categoryId")),
    __param(2, (0, common_1.Body)("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "createSubcategory", null);
__decorate([
    (0, common_1.Patch)("subcategories/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "updateSubcategory", null);
__decorate([
    (0, common_1.Delete)("subcategories/:id"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "removeSubcategory", null);
__decorate([
    (0, common_1.Patch)("subcategories/:id/restore"),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN", "OWNER", "MANAGER"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "restoreSubcategory", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, common_1.Controller)("categories"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map