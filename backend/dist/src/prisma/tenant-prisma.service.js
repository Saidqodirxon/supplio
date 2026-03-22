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
exports.TenantPrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const core_1 = require("@nestjs/core");
let TenantPrismaService = class TenantPrismaService {
    constructor(request) {
        this.request = request;
        this._client = null;
    }
    async onModuleInit() {
    }
    get client() {
        if (this._client)
            return this._client;
        const companyId = this.request.headers["x-company-id"];
        const dbUrl = process.env.DATABASE_URL?.replace("supplio", `supplio_tenant_${companyId}`);
        this._client = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: dbUrl,
                },
            },
        });
        this._attachMiddleware(this._client);
        return this._client;
    }
    _attachMiddleware(client) {
        client.$use(async (params, next) => {
            if (params.action === "delete") {
                params.action = "update";
                params.args["data"] = { deletedAt: new Date() };
            }
            if (params.action === "deleteMany") {
                params.action = "updateMany";
                if (params.args.data !== undefined) {
                    params.args.data["deletedAt"] = new Date();
                }
                else {
                    params.args["data"] = { deletedAt: new Date() };
                }
            }
            if (["findUnique", "findFirst", "findMany", "count"].includes(params.action)) {
                if (params.args.where) {
                    if (params.args.where.deletedAt === undefined) {
                        params.args.where["deletedAt"] = null;
                    }
                }
                else {
                    params.args["where"] = { deletedAt: null };
                }
            }
            return next(params);
        });
    }
    async onModuleDestroy() {
        if (this._client) {
            await this._client.$disconnect();
        }
    }
};
exports.TenantPrismaService = TenantPrismaService;
exports.TenantPrismaService = TenantPrismaService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [Object])
], TenantPrismaService);
//# sourceMappingURL=tenant-prisma.service.js.map