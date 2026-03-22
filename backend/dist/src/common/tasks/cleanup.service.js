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
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
let CleanupService = CleanupService_1 = class CleanupService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CleanupService_1.name);
    }
    async handleSoftDeleteCleanup() {
        this.logger.log("Starting soft-delete record cleanup (30-day retention)...");
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const modelsWithSoftDelete = [
            "company",
            "branch",
            "user",
            "dealer",
            "product",
            "order",
            "ledgerTransaction",
            "payment",
            "expense",
        ];
        let totalDeleted = 0;
        for (const model of modelsWithSoftDelete) {
            try {
                const result = await this.prisma[model].deleteMany({
                    where: {
                        deletedAt: {
                            lte: thirtyDaysAgo,
                            not: null,
                        },
                    },
                });
                totalDeleted += result.count;
                if (result.count > 0) {
                    this.logger.log(`Cleaned up ${result.count} from ${model}`);
                }
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : "Unknown error";
                this.logger.error(`Failed to clean up ${model}: ${msg}`);
            }
        }
        this.logger.log(`Cleanup completed. Total records purged: ${totalDeleted}`);
    }
};
exports.CleanupService = CleanupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupService.prototype, "handleSoftDeleteCleanup", null);
exports.CleanupService = CleanupService = CleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CleanupService);
//# sourceMappingURL=cleanup.service.js.map