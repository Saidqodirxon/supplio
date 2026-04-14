import { Injectable, Logger } from "@nestjs/common";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../../prisma/prisma.service";
import { TelegramLoggerService } from "../../../telegram/telegram-logger.service";
import { CompanyNotifierService } from "../../../telegram/company-notifier.service";

const execPromise = promisify(exec);

function sanitizeFilePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_\-.]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "") || "backup";
}

function buildPgDumpCommand(outputPath: string, rawDbUrl: string): string {
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
  } catch {
    // Keep the original value if it's not a standard URL.
  }

  return `pg_dump -f "${outputPath}"${schemaArg} "${sanitizedUrl}"`;
}

// ── SQL helpers ─────────────────────────────────────────────────────────────

function escVal(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

function toInserts(tableName: string, rows: Record<string, unknown>[]): string {
  if (!rows.length) return `-- ${tableName}: empty\n`;
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

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), "backups");

  constructor(
    private prisma: PrismaService,
    private loggerService: TelegramLoggerService,
    private companyNotifier: CompanyNotifierService,
  ) {
    if (!fs.existsSync(this.backupDir)) fs.mkdirSync(this.backupDir, { recursive: true });
  }

  private buildCompanyBackupFileName(companyName: string, slug?: string) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const safeSlug = sanitizeFilePart(slug || companyName).toUpperCase();
    return `SUPPLIO_${safeSlug}_${stamp}.sql`;
  }

  // ── Cron: Daily 01:00 full backup ────────────────────────────────────────

  @Cron("0 1 * * *")
  async handleDailyBackup() {
    this.logger.log("Daily Backup Triggered: 01:00 AM");
    try {
      const result = await this.createFullBackup();
      const fileName = path.basename(result.zipPath);

      // Super-admin backup bot (separate BACKUP_BOT_TOKEN channel)
      await this.loggerService.sendBackupFile(result.zipPath, fileName, 'Daily Full Backup');

      // Per-company backup: send each company's SQL to their own log group
      const companies = await this.prisma.company.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, slug: true },
      });
      for (const company of companies) {
        try {
          const sqlResult = await this.createCompanyBackup(company.id);
          await this.companyNotifier.notifyBackup(company.id, sqlResult.path, sqlResult.name);
        } catch (e: any) {
          this.logger.warn(`Per-company backup notify failed for ${company.name}: ${e?.message}`);
        }
      }

      this.logger.log("Daily backup complete");
      await this.cleanupOldBackups(2);
    } catch (err: any) {
      this.logger.error("Daily backup failed: " + (err?.message || err));
    }

    await this.prisma.systemSettings
      .update({ where: { id: "GLOBAL" }, data: { lastBackupAt: new Date() } })
      .catch(() => {});
  }

  // ── Keep only N most recent backups, delete the rest ─────────────────────

  private async cleanupOldBackups(keepCount: number): Promise<void> {
    if (!fs.existsSync(this.backupDir)) return;

    const entries = fs.readdirSync(this.backupDir).map((name) => {
      const fullPath = path.join(this.backupDir, name);
      const stats = fs.statSync(fullPath);
      return { name, fullPath, mtime: stats.mtimeMs, isDir: stats.isDirectory() };
    });

    // Sort newest first
    entries.sort((a, b) => b.mtime - a.mtime);

    const toDelete = entries.slice(keepCount);
    for (const entry of toDelete) {
      try {
        if (entry.isDir) {
          fs.rmSync(entry.fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(entry.fullPath);
        }
        this.logger.log(`Cleanup: deleted old backup ${entry.name}`);
      } catch (e: any) {
        this.logger.warn(`Cleanup: could not delete ${entry.name}: ${e?.message}`);
      }
    }
  }

  // ── Full backup: system pg_dump + per-company SQL + zip ──────────────────

  async createFullBackup(): Promise<{ zipPath: string; dir: string }> {
    const dateStr = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const sessionDir = path.join(this.backupDir, `backup-${dateStr}`);
    fs.mkdirSync(sessionDir, { recursive: true });

    // 1. Full system pg_dump
    const systemSqlPath = path.join(sessionDir, "system_full.sql");
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");
    this.logger.log("Running pg_dump for full system backup...");
    await execPromise(buildPgDumpCommand(systemSqlPath, dbUrl));
    this.logger.log(`System dump done: ${(fs.statSync(systemSqlPath).size / 1024).toFixed(1)} KB`);

    // 2. Per-company exports
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

    // 3. Zip the session folder
    const zipPath = sessionDir + ".zip";
    await this.zipFolder(sessionDir, zipPath);
    this.logger.log(`Zip created: ${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB`);

    return { zipPath, dir: sessionDir };
  }

  // ── Export single company data as SQL INSERT statements ──────────────────

  async exportCompanyToSql(companyId: string, companyName: string): Promise<string> {
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

    sql += toInserts("Branch", branches as any[]);
    sql += toInserts("Dealer", dealers as any[]);
    sql += toInserts("Product", products as any[]);
    sql += toInserts("Order", orders as any[]);
    sql += toInserts("Payment", payments as any[]);
    sql += toInserts("Expense", expenses as any[]);
    sql += toInserts("User", users as any[]);

    return sql;
  }

  // ── Zip a folder ─────────────────────────────────────────────────────────

  private async zipFolder(folderPath: string, zipPath: string): Promise<void> {
    // Try zip (Linux), then PowerShell (Windows)
    try {
      await execPromise(`zip -r "${zipPath}" "${path.basename(folderPath)}"`, { cwd: path.dirname(folderPath) });
      if (fs.existsSync(zipPath)) return;
    } catch { /* fall through */ }

    try {
      await execPromise(
        `powershell -Command "Compress-Archive -Path '${folderPath}' -DestinationPath '${zipPath}' -Force"`
      );
      if (fs.existsSync(zipPath)) return;
    } catch { /* fall through */ }

    // Last resort: tar.gz
    const tgzPath = zipPath.replace(/\.zip$/, ".tar.gz");
    await execPromise(`tar -czf "${tgzPath}" -C "${path.dirname(folderPath)}" "${path.basename(folderPath)}"`);
    if (fs.existsSync(tgzPath)) {
      // rename to .zip path so caller still finds it
      fs.renameSync(tgzPath, zipPath.replace(/\.zip$/, ".tar.gz"));
      throw new Error("zip not available; created .tar.gz instead");
    }
  }

  // ── Manual trigger (called from super-admin or endpoint) ─────────────────

  async createBackupAndSend(): Promise<{ name: string; size: number; createdAt: Date }> {
    const result = await this.createFullBackup();
    await this.sendToTelegram(
      result.zipPath,
      path.basename(result.zipPath),
      process.env.LOG_BOT_TOKEN,
      process.env.BACKUP_CHAT_ID || process.env.LOG_CHAT_ID
    );
    const stats = fs.statSync(result.zipPath);
    return { name: path.basename(result.zipPath), size: stats.size, createdAt: new Date() };
  }

  async createCompanyBackup(companyId: string): Promise<{ name: string; path: string; createdAt: Date; size: number }> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, slug: true, dbConnectionUrl: true },
    });
    if (!company) throw new Error("Company not found");

    const fileName = this.buildCompanyBackupFileName(company.name, company.slug);
    const filePath = path.join(this.backupDir, fileName);

    if (company.dbConnectionUrl) {
      await execPromise(buildPgDumpCommand(filePath, company.dbConnectionUrl));
    } else {
      const sql = await this.exportCompanyToSql(company.id, company.name);
      fs.writeFileSync(filePath, sql, "utf8");
    }

    const stats = fs.statSync(filePath);
    return { name: fileName, path: filePath, createdAt: stats.birthtime, size: stats.size };
  }

  async createCompanyBackupAndSend(companyId: string): Promise<{ name: string; size: number; createdAt: Date }> {
    const result = await this.createCompanyBackup(companyId);
    await this.sendToTelegram(
      result.path,
      result.name,
      process.env.LOG_BOT_TOKEN,
      process.env.BACKUP_CHAT_ID || process.env.LOG_CHAT_ID
    );
    return { name: result.name, size: result.size, createdAt: result.createdAt };
  }

  // ── Legacy method kept for compatibility ─────────────────────────────────

  async createBackup(): Promise<{ name: string; path: string; createdAt: Date }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup-${timestamp}.sql`;
    const filePath = path.join(this.backupDir, fileName);
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not found");
    await execPromise(buildPgDumpCommand(filePath, dbUrl));
    return { name: fileName, path: filePath, createdAt: new Date() };
  }

  // ── Send file to Telegram ─────────────────────────────────────────────────

  async sendToTelegram(filePath: string, fileName: string, token?: string, chatId?: string): Promise<void> {
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

    await new Promise<void>((resolve) => {
      const boundary = `----FormBoundary${Date.now()}`;
      const metadata = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chat}\r\n` +
        `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n` +
        `--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nMarkdown\r\n` +
        `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`
      );
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
          if (res.statusCode === 200) this.logger.log(`✅ Backup sent to Telegram: ${fileName}`);
          else this.logger.error(`Telegram send failed (${res.statusCode}): ${body}`);
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

  // ── Dump single company DB (for owner download) ───────────────────────────

  async dumpCompanyDatabase(companyId: string, slug: string): Promise<string> {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const safeName = `SUPPLIO_${slug.toUpperCase()}_${new Date().toISOString().split("T")[0]}`;
    const outputPath = path.join(this.backupDir, `${safeName}.sql`);

    if (company?.dbConnectionUrl) {
      // Company has its own DB — do a real pg_dump
      await execPromise(buildPgDumpCommand(outputPath, company.dbConnectionUrl));
    } else {
      // Shared DB — export via Prisma
      const sql = await this.exportCompanyToSql(companyId, company?.name || slug);
      fs.writeFileSync(outputPath, sql, "utf8");
    }
    return outputPath;
  }

  resolveBackupPath(name: string): string {
    const safeName = path.basename(name);
    const fullPath = path.join(this.backupDir, safeName);
    if (!fs.existsSync(fullPath)) {
      throw new Error("Backup file not found");
    }
    return fullPath;
  }

  async listBackups() {
    if (!fs.existsSync(this.backupDir)) return [];
    return fs
      .readdirSync(this.backupDir)
      .map((file) => {
        const stats = fs.statSync(path.join(this.backupDir, file));
        return { name: file, size: stats.size, createdAt: stats.birthtime };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // ── Enterprise Rule 13: Retention Purge ──────────────────────────────────

  @Cron(CronExpression.EVERY_WEEKEND)
  async purgeSoftDeletedRecords() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const target = { where: { deletedAt: { lt: thirtyDaysAgo } } };
    await this.prisma.lead.deleteMany(target);
    await this.prisma.order.deleteMany(target);
    this.logger.log("Enterprise Purge: Cleanup completed.");
  }
}
