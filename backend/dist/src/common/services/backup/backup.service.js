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
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = require("fs");
const path = require("path");
const https = require("https");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../prisma/prisma.service");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
function sanitizeFilePart(value) {
    return value.replace(/[^a-zA-Z0-9_\-.]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "") || "backup";
}
function buildPgDumpCommand(outputPath, rawDbUrl) {
    let sanitizedUrl = rawDbUrl;
    let schemaArg = "";
    try {
        const parsed = new URL(rawDbUrl);
        const schema = parsed.searchParams.get("schema");
        if (schema) {
            parsed.searchParams.delete("schema");
            sanitizedUrl = parsed.toString();
            schemaArg = ` --schema="${schema}"`;
        }
    }
    catch {
    }
    return `pg_dump -f "${outputPath}"${schemaArg} "${sanitizedUrl}"`;
}
function escVal(val) {
    if (val === null || val === undefined)
        return "NULL";
    if (typeof val === "number")
        return String(val);
    if (typeof val === "boolean")
        return val ? "TRUE" : "FALSE";
    if (val instanceof Date)
        return `'${val.toISOString()}'`;
    if (typeof val === "object")
        return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    return `'${String(val).replace(/'/g, "''")}'`;
}
function toInserts(tableName, rows) {
    if (!rows.length)
        return `-- ${tableName}: empty\n`;
    const cols = Object.keys(rows[0]);
    const header = `-- ${tableName} (${rows.length} rows)\n`;
    const stmts = rows
        .map((r) => {
        const vals = cols.map((c) => escVal(r[c])).join(", ");
        return `INSERT INTO "${tableName}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${vals}) ON CONFLICT DO NOTHING;`;
    })
        .join("\n");
    return header + stmts + "\n\n";
}
let BackupService = BackupService_1 = class BackupService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.backupDir = path.join(process.cwd(), "backups");
        if (!fs.existsSync(this.backupDir))
            fs.mkdirSync(this.backupDir, { recursive: true });
    }
    buildCompanyBackupFileName(companyName, slug) {
        const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const safeSlug = sanitizeFilePart(slug || companyName).toUpperCase();
        return `SUPPLIO_${safeSlug}_${stamp}.sql`;
    }
    async handleDailyBackup() {
        this.logger.log("Daily Backup Triggered: 01:00 AM");
        try {
            const result = await this.createFullBackup();
            await this.sendToTelegram(result.zipPath, path.basename(result.zipPath), process.env.LOG_BOT_TOKEN, process.env.BACKUP_CHAT_ID || process.env.LOG_CHAT_ID);
            this.logger.log("Daily backup complete");
            await this.cleanupOldBackups(2);
        }
        catch (err) {
            this.logger.error("Daily backup failed: " + (err?.message || err));
        }
        await this.prisma.systemSettings
            .update({ where: { id: "GLOBAL" }, data: { lastBackupAt: new Date() } })
            .catch(() => { });
    }
    async cleanupOldBackups(keepCount) {
        if (!fs.existsSync(this.backupDir))
            return;
        const entries = fs.readdirSync(this.backupDir).map((name) => {
            const fullPath = path.join(this.backupDir, name);
            const stats = fs.statSync(fullPath);
            return { name, fullPath, mtime: stats.mtimeMs, isDir: stats.isDirectory() };
        });
        entries.sort((a, b) => b.mtime - a.mtime);
        const toDelete = entries.slice(keepCount);
        for (const entry of toDelete) {
            try {
                if (entry.isDir) {
                    fs.rmSync(entry.fullPath, { recursive: true, force: true });
                }
                else {
                    fs.unlinkSync(entry.fullPath);
                }
                this.logger.log(`Cleanup: deleted old backup ${entry.name}`);
            }
            catch (e) {
                this.logger.warn(`Cleanup: could not delete ${entry.name}: ${e?.message}`);
            }
        }
    }
    async createFullBackup() {
        const dateStr = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const sessionDir = path.join(this.backupDir, `backup-${dateStr}`);
        fs.mkdirSync(sessionDir, { recursive: true });
        const systemSqlPath = path.join(sessionDir, "system_full.sql");
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl)
            throw new Error("DATABASE_URL not set");
        this.logger.log("Running pg_dump for full system backup...");
        await execPromise(buildPgDumpCommand(systemSqlPath, dbUrl));
        this.logger.log(`System dump done: ${(fs.statSync(systemSqlPath).size / 1024).toFixed(1)} KB`);
        const companies = await this.prisma.company.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true, slug: true },
        });
        for (const company of companies) {
            const safeName = company.name.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 40);
            const companyDir = path.join(sessionDir, safeName);
            fs.mkdirSync(companyDir, { recursive: true });
            const sqlPath = path.join(companyDir, `${safeName}.sql`);
            const sql = await this.exportCompanyToSql(company.id, company.name);
            fs.writeFileSync(sqlPath, sql, "utf8");
            this.logger.log(`Exported ${company.name}: ${(fs.statSync(sqlPath).size / 1024).toFixed(1)} KB`);
        }
        const zipPath = sessionDir + ".zip";
        await this.zipFolder(sessionDir, zipPath);
        this.logger.log(`Zip created: ${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB`);
        return { zipPath, dir: sessionDir };
    }
    async exportCompanyToSql(companyId, companyName) {
        const now = new Date().toISOString();
        let sql = `-- Supplio Company Export\n-- Company: ${companyName}\n-- Exported: ${now}\n-- ID: ${companyId}\n\n`;
        const [branches, dealers, products, orders, payments, expenses, users] = await Promise.all([
            this.prisma.branch.findMany({ where: { companyId } }),
            this.prisma.dealer.findMany({ where: { companyId } }),
            this.prisma.product.findMany({ where: { companyId } }),
            this.prisma.order.findMany({ where: { companyId } }),
            this.prisma.payment.findMany({ where: { companyId } }),
            this.prisma.expense.findMany({ where: { companyId } }),
            this.prisma.user.findMany({
                where: { companyId },
                select: { id: true, companyId: true, branchId: true, phone: true, fullName: true, roleType: true, isActive: true, createdAt: true },
            }),
        ]);
        sql += toInserts("Branch", branches);
        sql += toInserts("Dealer", dealers);
        sql += toInserts("Product", products);
        sql += toInserts("Order", orders);
        sql += toInserts("Payment", payments);
        sql += toInserts("Expense", expenses);
        sql += toInserts("User", users);
        return sql;
    }
    async zipFolder(folderPath, zipPath) {
        try {
            await execPromise(`zip -r "${zipPath}" "${path.basename(folderPath)}"`, { cwd: path.dirname(folderPath) });
            if (fs.existsSync(zipPath))
                return;
        }
        catch { }
        try {
            await execPromise(`powershell -Command "Compress-Archive -Path '${folderPath}' -DestinationPath '${zipPath}' -Force"`);
            if (fs.existsSync(zipPath))
                return;
        }
        catch { }
        const tgzPath = zipPath.replace(/\.zip$/, ".tar.gz");
        await execPromise(`tar -czf "${tgzPath}" -C "${path.dirname(folderPath)}" "${path.basename(folderPath)}"`);
        if (fs.existsSync(tgzPath)) {
            fs.renameSync(tgzPath, zipPath.replace(/\.zip$/, ".tar.gz"));
            throw new Error("zip not available; created .tar.gz instead");
        }
    }
    async createBackupAndSend() {
        const result = await this.createFullBackup();
        await this.sendToTelegram(result.zipPath, path.basename(result.zipPath), process.env.LOG_BOT_TOKEN, process.env.BACKUP_CHAT_ID || process.env.LOG_CHAT_ID);
        const stats = fs.statSync(result.zipPath);
        return { name: path.basename(result.zipPath), size: stats.size, createdAt: new Date() };
    }
    async createCompanyBackup(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true, slug: true, dbConnectionUrl: true },
        });
        if (!company)
            throw new Error("Company not found");
        const fileName = this.buildCompanyBackupFileName(company.name, company.slug);
        const filePath = path.join(this.backupDir, fileName);
        if (company.dbConnectionUrl) {
            await execPromise(buildPgDumpCommand(filePath, company.dbConnectionUrl));
        }
        else {
            const sql = await this.exportCompanyToSql(company.id, company.name);
            fs.writeFileSync(filePath, sql, "utf8");
        }
        const stats = fs.statSync(filePath);
        return { name: fileName, path: filePath, createdAt: stats.birthtime, size: stats.size };
    }
    async createCompanyBackupAndSend(companyId) {
        const result = await this.createCompanyBackup(companyId);
        await this.sendToTelegram(result.path, result.name, process.env.LOG_BOT_TOKEN, process.env.BACKUP_CHAT_ID || process.env.LOG_CHAT_ID);
        return { name: result.name, size: result.size, createdAt: result.createdAt };
    }
    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `backup-${timestamp}.sql`;
        const filePath = path.join(this.backupDir, fileName);
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl)
            throw new Error("DATABASE_URL not found");
        await execPromise(buildPgDumpCommand(filePath, dbUrl));
        return { name: fileName, path: filePath, createdAt: new Date() };
    }
    async sendToTelegram(filePath, fileName, token, chatId) {
        const tok = token || process.env.LOG_BOT_TOKEN;
        const chat = chatId || process.env.LOG_CHAT_ID;
        if (!tok || !chat) {
            this.logger.warn("Telegram credentials not set — skipping send");
            return;
        }
        if (!fs.existsSync(filePath)) {
            this.logger.warn(`File not found: ${filePath}`);
            return;
        }
        const stats = fs.statSync(filePath);
        const fileStream = fs.createReadStream(filePath);
        const caption = `📦 *Supplio Backup*\n📅 ${new Date().toLocaleString("uz-UZ")}\n📁 ${fileName}\n💾 ${(stats.size / 1024).toFixed(1)} KB`;
        await new Promise((resolve) => {
            const boundary = `----FormBoundary${Date.now()}`;
            const metadata = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chat}\r\n` +
                `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n` +
                `--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nMarkdown\r\n` +
                `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`);
            const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
            const req = https.request({
                hostname: "api.telegram.org",
                path: `/bot${tok}/sendDocument`,
                method: "POST",
                headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
            }, (res) => {
                let body = "";
                res.on("data", (d) => (body += d));
                res.on("end", () => {
                    if (res.statusCode === 200)
                        this.logger.log(`✅ Backup sent to Telegram: ${fileName}`);
                    else
                        this.logger.error(`Telegram send failed (${res.statusCode}): ${body}`);
                    resolve();
                });
            });
            req.on("error", (e) => { this.logger.error("Telegram request error: " + e.message); resolve(); });
            req.write(metadata);
            fileStream.on("data", (chunk) => req.write(chunk));
            fileStream.on("end", () => { req.write(tail); req.end(); });
            fileStream.on("error", () => { req.end(); resolve(); });
        });
    }
    async dumpCompanyDatabase(companyId, slug) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        const safeName = `SUPPLIO_${slug.toUpperCase()}_${new Date().toISOString().split("T")[0]}`;
        const outputPath = path.join(this.backupDir, `${safeName}.sql`);
        if (company?.dbConnectionUrl) {
            await execPromise(buildPgDumpCommand(outputPath, company.dbConnectionUrl));
        }
        else {
            const sql = await this.exportCompanyToSql(companyId, company?.name || slug);
            fs.writeFileSync(outputPath, sql, "utf8");
        }
        return outputPath;
    }
    resolveBackupPath(name) {
        const safeName = path.basename(name);
        const fullPath = path.join(this.backupDir, safeName);
        if (!fs.existsSync(fullPath)) {
            throw new Error("Backup file not found");
        }
        return fullPath;
    }
    async listBackups() {
        if (!fs.existsSync(this.backupDir))
            return [];
        return fs
            .readdirSync(this.backupDir)
            .map((file) => {
            const stats = fs.statSync(path.join(this.backupDir, file));
            return { name: file, size: stats.size, createdAt: stats.birthtime };
        })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async purgeSoftDeletedRecords() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const target = { where: { deletedAt: { lt: thirtyDaysAgo } } };
        await this.prisma.lead.deleteMany(target);
        await this.prisma.order.deleteMany(target);
        this.logger.log("Enterprise Purge: Cleanup completed.");
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)("0 1 * * *"),
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