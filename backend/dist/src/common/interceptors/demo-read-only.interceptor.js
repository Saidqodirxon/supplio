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
exports.DemoReadOnlyInterceptor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DemoReadOnlyInterceptor = class DemoReadOnlyInterceptor {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, headers } = request;
        const companyId = headers["x-company-id"];
        if (!companyId)
            return next.handle();
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { isDemo: true },
        });
        const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
        if (company?.isDemo && isMutating) {
            const whitelistedPaths = ["/demo/test-action", "/orders/preview"];
            const isWhitelisted = whitelistedPaths.some((path) => request.url.includes(path));
            if (!isWhitelisted) {
                throw new common_1.ForbiddenException("DEMO_MODE_RESTRICTION: This is 100% read-only demo environment. Data persistence is disabled to protect shared mock data. To test full capability, please request a Private Trial.");
            }
        }
        return next.handle();
    }
};
exports.DemoReadOnlyInterceptor = DemoReadOnlyInterceptor;
exports.DemoReadOnlyInterceptor = DemoReadOnlyInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DemoReadOnlyInterceptor);
//# sourceMappingURL=demo-read-only.interceptor.js.map