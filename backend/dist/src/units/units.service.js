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
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UnitsService = class UnitsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId) {
        return this.prisma.unit.findMany({
            where: {
                OR: [{ companyId }, { companyId: null }],
                deletedAt: null,
            },
            orderBy: { name: "asc" },
        });
    }
    async create(companyId, data) {
        return this.prisma.unit.create({
            data: { companyId, name: data.name, symbol: data.symbol ?? "" },
        });
    }
    async update(id, companyId, data) {
        const unit = await this.prisma.unit.findFirst({
            where: { id, companyId, deletedAt: null },
        });
        if (!unit)
            throw new common_1.NotFoundException("Unit not found");
        return this.prisma.unit.update({ where: { id }, data });
    }
    async remove(id, companyId) {
        const unit = await this.prisma.unit.findFirst({
            where: { id, companyId, deletedAt: null },
        });
        if (!unit)
            throw new common_1.NotFoundException("Unit not found");
        return this.prisma.unit.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async seedDefaults() {
        const defaults = [
            { name: "Dona", symbol: "dona" },
            { name: "Kilogramm", symbol: "kg" },
            { name: "Gramm", symbol: "g" },
            { name: "Litr", symbol: "l" },
            { name: "Millilitr", symbol: "ml" },
            { name: "Metr", symbol: "m" },
            { name: "Santimetr", symbol: "sm" },
            { name: "Quti", symbol: "quti" },
            { name: "Paket", symbol: "paket" },
        ];
        for (const d of defaults) {
            const exists = await this.prisma.unit.findFirst({
                where: { name: d.name, companyId: null },
            });
            if (!exists) {
                await this.prisma.unit.create({ data: d });
            }
        }
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitsService);
//# sourceMappingURL=units.service.js.map