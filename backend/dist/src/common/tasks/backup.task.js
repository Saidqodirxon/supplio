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
var BackupTask_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupTask = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = require("path");
const fs = require("fs");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let BackupTask = BackupTask_1 = class BackupTask {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BackupTask_1.name);
    }
    async handleDailyBackup() {
        this.logger.log("Starting daily automated backup...");
        const backupDir = path.join(process.cwd(), "backups");
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `supplio_backup_${timestamp}.sql`;
        const filePath = path.join(backupDir, fileName);
        try {
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
                throw new Error("DATABASE_URL not found in environment");
            }
            const cmd = `pg_dump "${dbUrl}" > "${filePath}"`;
            await execAsync(cmd);
            this.logger.log(`Daily backup completed: ${fileName}`);
            this.rotateBackups(backupDir);
        }
        catch (error) {
            this.logger.error(`Automated backup failed: ${error.message}`);
        }
    }
    rotateBackups(dir) {
        const files = fs
            .readdirSync(dir)
            .filter((f) => f.startsWith("supplio_backup_"))
            .map((f) => ({
            name: f,
            time: fs.statSync(path.join(dir, f)).mtime.getTime(),
        }))
            .sort((a, b) => b.time - a.time);
        if (files.length > 10) {
            for (let i = 10; i < files.length; i++) {
                fs.unlinkSync(path.join(dir, files[i].name));
                this.logger.log(`Old backup removed: ${files[i].name}`);
            }
        }
    }
};
exports.BackupTask = BackupTask;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupTask.prototype, "handleDailyBackup", null);
exports.BackupTask = BackupTask = BackupTask_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BackupTask);
//# sourceMappingURL=backup.task.js.map