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
exports.DemoReadonlyMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const DEMO_VIEWER_PHONE = "+998000000000";
const SAFE_MUTATING_PATH_PREFIXES = [
    "/api/auth/login",
    "/api/leads",
    "/api/demo/access",
];
let DemoReadonlyMiddleware = class DemoReadonlyMiddleware {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async use(req, _res, next) {
        const method = String(req.method || "GET").toUpperCase();
        if (["GET", "HEAD", "OPTIONS"].includes(method)) {
            return next();
        }
        const path = String(req.originalUrl || req.url || "").split("?")[0];
        if (SAFE_MUTATING_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
            return next();
        }
        const demoHeader = String(req.headers?.["x-supplio-demo"] || "").toLowerCase();
        const accessHeader = String(req.headers?.["x-supplio-demo-access"] || "").toLowerCase();
        const isDemoRequest = demoHeader === "true" || demoHeader === "1";
        const isFullAccess = accessHeader === "full" ||
            accessHeader === "edit" ||
            accessHeader === "write";
        if (!isDemoRequest) {
            return next();
        }
        const authHeader = String(req.headers?.authorization || "");
        if (!authHeader.startsWith("Bearer ")) {
            return next();
        }
        const token = authHeader.slice(7);
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET || "secretKey",
            });
            if (!payload?.sub) {
                return next();
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    phone: true,
                    company: { select: { isDemo: true } },
                },
            });
            if (!user?.company?.isDemo) {
                return next();
            }
            if (user.phone === DEMO_VIEWER_PHONE && !isFullAccess) {
                throw new common_1.ForbiddenException("DEMO_READ_ONLY: Bu demo akkaunt faqat ko'rish uchun. Edit/Create uchun demo so'rov yuboring.");
            }
            return next();
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            return next();
        }
    }
};
exports.DemoReadonlyMiddleware = DemoReadonlyMiddleware;
exports.DemoReadonlyMiddleware = DemoReadonlyMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], DemoReadonlyMiddleware);
//# sourceMappingURL=demo-readonly.middleware.js.map