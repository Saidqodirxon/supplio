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
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plan_limits_service_1 = require("../common/services/plan-limits.service");
let BranchesService = class BranchesService {
    constructor(prisma, planLimits) {
        this.prisma = prisma;
        this.planLimits = planLimits;
    }
    async create(companyId, data) {
        await this.planLimits.checkBranchLimit(companyId);
        return this.prisma.branch.create({
            data: { companyId, name: data.name, address: data.address, phone: data.phone },
        });
    }
    async findAll(companyId) {
        return this.prisma.branch.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { createdAt: "asc" },
            include: {
                _count: {
                    select: { users: true, dealers: true, orders: true },
                },
            },
        });
    }
    async findOne(companyId, id) {
        const branch = await this.prisma.branch.findUnique({ where: { id } });
        if (!branch || branch.companyId !== companyId || branch.deletedAt) {
            throw new common_1.ForbiddenException("Branch not found or access denied");
        }
        return branch;
    }
    async update(companyId, id, data) {
        await this.findOne(companyId, id);
        return this.prisma.branch.update({ where: { id }, data });
    }
    async remove(companyId, id, deletedBy) {
        await this.findOne(companyId, id);
        return this.prisma.branch.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    }
    async restore(companyId, id) {
        const branch = await this.prisma.branch.findFirst({ where: { id, companyId } });
        if (!branch)
            throw new common_1.NotFoundException("Branch not found");
        return this.prisma.branch.update({
            where: { id },
            data: { deletedAt: null, deletedBy: null },
        });
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plan_limits_service_1.PlanLimitsService])
], BranchesService);
//# sourceMappingURL=branches.service.js.map