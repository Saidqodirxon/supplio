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
var CleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CleanupService = CleanupService_1 = class CleanupService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CleanupService_1.name);
        setInterval(() => this.purgeDeletedData(), 24 * 60 * 60 * 1000);
    }
    async purgeDeletedData() {
        this.logger.log("Starting 30-day purge of soft-deleted data...");
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const models = [
            "company",
            "branch",
            "user",
            "dealer",
            "product",
            "order",
            "ledgerTransaction",
            "payment",
            "expense",
            "customBot",
        ];
        for (const model of models) {
            try {
                const deletedCount = await this.prisma[model].deleteMany({
                    where: {
                        deletedAt: {
                            lte: thirtyDaysAgo,
                            not: null,
                        },
                    },
                });
                if (deletedCount.count > 0) {
                    this.logger.log(`Purged ${deletedCount.count} records from ${model}`);
                }
            }
            catch (err) {
                this.logger.error(`Failed to purge ${model}: ${err}`);
            }
        }
        this.logger.log("Purge complete.");
    }
};
exports.CleanupService = CleanupService;
exports.CleanupService = CleanupService = CleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CleanupService);
//# sourceMappingURL=cleanup.service.js.map