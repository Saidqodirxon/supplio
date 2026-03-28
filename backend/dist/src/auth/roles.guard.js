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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride("roles", [context.getHandler(), context.getClass()]);
        const requiredPermissions = this.reflector.getAllAndOverride("permissions", [context.getHandler(), context.getClass()]);
        if (!requiredRoles && !requiredPermissions)
            return true;
        const { user } = context.switchToHttp().getRequest();
        if (!user)
            return false;
        if (user.roleType === client_1.RoleType.SUPER_ADMIN)
            return true;
        if (requiredRoles && requiredRoles.includes(user.roleType))
            return true;
        if (requiredPermissions && user.customRole?.permissions) {
            const userPermissions = user.customRole.permissions;
            const hasPermission = requiredPermissions.every((p) => userPermissions[p] === true);
            if (hasPermission)
                return true;
        }
        throw new common_1.ForbiddenException("FORBIDDEN: You do not have sufficient permissions to perform this action.");
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map