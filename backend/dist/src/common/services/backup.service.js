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
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = require("fs");
const path = require("path");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let BackupService = BackupService_1 = class BackupService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.backupDir = path.join(process.cwd(), "backups");
        if (!fs.existsSync(this.backupDir))
            fs.mkdirSync(this.backupDir);
    }
    async handleDailyBackup() {
        this.logger.log("Enterprise Backup System Triggered: Process ID 03:00 (G6)");
        const companies = await this.prisma.company.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true, slug: true, dbConnectionUrl: true },
        });
        for (const company of companies) {
            try {
                const dumpPath = await this.dumpCompanyDatabase(company.id, company.slug);
                this.logger.log(`✓ Backup Created for Tenant: ${company.name} [${company.id}]`);
            }
            catch (err) {
                this.logger.error(`❌ FAILED Backup for Tenant: ${company.name}`, err);
            }
        }
        await this.prisma.systemSettings.update({
            where: { id: "GLOBAL" },
            data: { lastBackupAt: new Date() },
        });
    }
    async dumpCompanyDatabase(companyId, slug) {
        const filename = `SUPPLIO_${slug.toUpperCase()}_${new Date().toISOString().split("T")[0]}.sql`;
        const outputPath = path.join(this.backupDir, filename);
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        const connectionUri = company?.dbConnectionUrl || process.env.DATABASE_URL;
        const command = `pg_dump "${connectionUri}" -f "${outputPath}"`;
        await execAsync(command);
        return outputPath;
    }
    async purgeSoftDeletedRecords() {
        this.logger.log("Enterprise Purge: Cleaning up soft-deleted records older than 30 days...");
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const deletionTarget = { where: { deletedAt: { lt: thirtyDaysAgo } } };
        await this.prisma.lead.deleteMany(deletionTarget);
        await this.prisma.order.deleteMany(deletionTarget);
        await this.prisma.dealer.deleteMany(deletionTarget);
        this.logger.log("✓ Retention Purge Completed.");
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "handleDailyBackup", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_WEEKEND),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "purgeSoftDeletedRecords", null);
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BackupService);
//# sourceMappingURL=backup.service.js.map