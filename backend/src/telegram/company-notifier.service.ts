import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { Cron } from '@nestjs/schedule';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyNotifierService implements OnModuleInit {
  private readonly logger = new Logger(CompanyNotifierService.name);
  // Cache Telegraf instances by token to avoid recreating on every call
  private readonly botCache = new Map<string, Telegraf>();

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('CompanyNotifierService ready');
  }

  // ─── Internal helpers ────────────────────────────────────────────────────

  private getBot(token: string): Telegraf {
    if (!this.botCache.has(token)) {
      this.botCache.set(token, new Telegraf(token));
    }
    return this.botCache.get(token)!;
  }

  private async getInfo(companyId: string): Promise<{
    token: string;
    logChatId: string | null;
    orderChatId: string | null;
    slug: string;
  } | null> {
    const [company, botRecord] = await Promise.all([
      this.prisma.company.findUnique({ where: { id: companyId } }),
      this.prisma.customBot.findFirst({
        where: { companyId, isActive: true, deletedAt: null },
      }),
    ]);
    if (!botRecord?.token) return null;
    return {
      token: botRecord.token,
      logChatId: (company as any)?.logGroupChatId ?? null,
      orderChatId: (company as any)?.orderGroupChatId ?? null,
      slug: (company as any)?.slug ?? companyId.slice(-6),
    };
  }

  private tag(slug: string, type: string) {
    return `#${type}_${slug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
  }

  private async send(token: string, chatId: string, text: string) {
    try {
      await this.getBot(token).telegram.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
      });
    } catch (e: any) {
      this.logger.warn(`notify send failed → chat ${chatId}: ${e?.message}`);
    }
  }

  private statusLabel(status: string) {
    const map: Record<string, string> = {
      PENDING: 'Kutilmoqda',
      ACCEPTED: 'Qabul qilindi',
      PREPARING: 'Tayyorlanmoqda',
      SHIPPED: 'Yuborildi',
      DELIVERED: 'Yetkazildi',
      COMPLETED: 'Yakunlandi',
      CANCELLED: 'Bekor qilindi',
      RETURNED: 'Qaytarildi',
    };
    return map[String(status || '').toUpperCase()] ?? status;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Called when a new order is created (from orders service or bot checkout) */
  async notifyNewOrder(companyId: string, order: {
    id: string;
    totalAmount: number;
    dealerName: string;
    dealerPhone: string;
    branchName: string;
    items: Array<{ name: string; qty: number; unit: string; price: number; total: number }>;
  }) {
    const info = await this.getInfo(companyId);
    if (!info) return;

    const MAX_ITEMS = 12;
    const itemLines = order.items
      .slice(0, MAX_ITEMS)
      .map((i, idx) =>
        `${idx + 1}. *${i.name}* — ${i.qty} ${i.unit} × ${i.price.toLocaleString()} = ${i.total.toLocaleString()}`
      )
      .join('\n');
    const more = order.items.length > MAX_ITEMS ? `\n_...va yana ${order.items.length - MAX_ITEMS} ta_` : '';

    const orderText =
      `🛒 *Yangi buyurtma!* ${this.tag(info.slug, 'ORDER')}\n` +
      `🆔 \`${order.id.slice(-8).toUpperCase()}\`\n\n` +
      `👤 *${order.dealerName}*\n` +
      `📞 ${order.dealerPhone}\n` +
      `🏪 ${order.branchName}\n\n` +
      `📦 *Mahsulotlar:*\n${itemLines}${more}\n\n` +
      `💰 *Jami: ${order.totalAmount.toLocaleString()} so'm*\n` +
      `📅 ${new Date().toLocaleString('uz-UZ')}`;

    if (info.orderChatId) await this.send(info.token, info.orderChatId, orderText);
    if (info.logChatId) {
      await this.send(
        info.token,
        info.logChatId,
        `📋 *Log CREATE\_ORDER* ${this.tag(info.slug, 'LOG')}\n` +
          `ID: \`${order.id.slice(-8).toUpperCase()}\` | ${order.dealerName} | ${order.totalAmount.toLocaleString()} so'm`,
      );
    }
  }

  /** Generic activity log — sent only to log group */
  async notifyLog(
    companyId: string,
    action: string,
    actor: string,
    details: Record<string, string | number | boolean | null | undefined> = {},
  ) {
    const info = await this.getInfo(companyId);
    if (!info?.logChatId) return;

    const lines = Object.entries(details)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    const text =
      `📝 *${action}* ${this.tag(info.slug, 'LOG')}\n` +
      `👤 ${actor}\n` +
      (lines ? lines + '\n' : '') +
      `⏱ ${new Date().toLocaleString('uz-UZ')}`;

    await this.send(info.token, info.logChatId, text);
  }

  /** Distributor paneli uchun: faqat buyurtma holati kim va qachon o'zgartirgani logi */
  async notifyOrderStatusChanged(
    companyId: string,
    payload: {
      orderId: string;
      oldStatus: string;
      newStatus: string;
      editorId?: string;
      editorPhone?: string;
      editorRole?: string;
      changedAt?: Date;
    },
  ) {
    const info = await this.getInfo(companyId);
    if (!info?.logChatId) return;

    const editor = payload.editorId
      ? await this.prisma.user
          .findUnique({
            where: { id: payload.editorId },
            select: { fullName: true, phone: true, roleType: true },
          })
          .catch(() => null)
      : null;

    const editorName =
      editor?.fullName ||
      payload.editorPhone ||
      editor?.phone ||
      "Noma'lum foydalanuvchi";
    const editorRole = payload.editorRole || editor?.roleType || 'UNKNOWN';
    const changedAt = payload.changedAt ?? new Date();

    const text =
      `📌 *Buyurtma holati o'zgartirildi* ${this.tag(info.slug, 'ORDER_STATUS')}\n` +
      `🆔 Buyurtma: \`${payload.orderId.slice(-8).toUpperCase()}\`\n` +
      `🔄 Holat: *${this.statusLabel(payload.oldStatus)}* → *${this.statusLabel(payload.newStatus)}*\n` +
      `👤 O'zgartirgan: *${editorName}*\n` +
      `🛡 Rol: *${editorRole}*\n` +
      `⏱ Vaqt: ${changedAt.toLocaleString('uz-UZ')}`;

    await this.send(info.token, info.logChatId, text);
  }

  /** Send backup file to the company's log group */
  async notifyBackup(companyId: string, filePath: string, fileName: string) {
    const info = await this.getInfo(companyId);
    if (!info?.logChatId) return;
    if (!fs.existsSync(filePath)) return;

    try {
      const caption =
        `💾 *Backup* ${this.tag(info.slug, 'BACKUP')}\n` +
        `📄 ${fileName}\n` +
        `📅 ${new Date().toLocaleString('uz-UZ')}`;
      await this.getBot(info.token).telegram.sendDocument(
        info.logChatId,
        { source: fs.createReadStream(filePath), filename: fileName },
        { caption, parse_mode: 'Markdown' },
      );
    } catch (e: any) {
      this.logger.warn(`notifyBackup failed for ${companyId}: ${e?.message}`);
    }
  }

  /** Send a test ping to verify the group works */
  async testGroup(companyId: string, type: 'log' | 'order') {
    const info = await this.getInfo(companyId);
    if (!info) throw new Error('No active bot found for this company');
    const chatId = type === 'log' ? info.logChatId : info.orderChatId;
    if (!chatId) throw new Error(`${type}GroupChatId not configured`);
    await this.getBot(info.token).telegram.sendMessage(
      chatId,
      `✅ *Test xabari* — ${type === 'log' ? 'Admin/Log guruh' : 'Buyurtmalar guruh'} ${this.tag(info.slug, type === 'log' ? 'LOG' : 'ORDER')}\n🕐 ${new Date().toLocaleString('uz-UZ')}`,
      { parse_mode: 'Markdown' },
    );
    return { ok: true };
  }

  // ─── Daily backup report (01:30 every day) ───────────────────────────────

  @Cron('30 1 * * *')
  async runDailyReportsForAllCompanies() {
    this.logger.log('Running daily company reports…');
    const companies = await this.prisma.company.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });
    for (const { id } of companies) {
      await this.sendDailyReport(id).catch((e) =>
        this.logger.warn(`Daily report failed for ${id}: ${e?.message}`),
      );
    }
  }

  async sendDailyReport(companyId: string) {
    const info = await this.getInfo(companyId);
    if (!info?.logChatId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [company, totalOrders, todayOrders, totalDealers, products, pendingOrders, todayRevenue] =
      await Promise.all([
        this.prisma.company.findUnique({ where: { id: companyId }, select: { name: true } }),
        this.prisma.order.count({ where: { companyId, deletedAt: null } }),
        this.prisma.order.count({ where: { companyId, deletedAt: null, createdAt: { gte: today } } }),
        this.prisma.dealer.count({ where: { companyId, deletedAt: null, isApproved: true } }),
        this.prisma.product.findMany({
          where: { companyId, deletedAt: null, isActive: true },
          select: { name: true, stock: true, unit: true },
          orderBy: { stock: 'asc' },
          take: 10,
        }),
        this.prisma.order.count({ where: { companyId, status: 'PENDING', deletedAt: null } }),
        this.prisma.order.aggregate({
          where: { companyId, deletedAt: null, createdAt: { gte: today } },
          _sum: { totalAmount: true },
        }),
      ]);

    const lowStockLines = products
      .filter((p) => p.stock <= 5)
      .map((p) => `⚠️ ${p.name}: *${p.stock} ${p.unit}*`)
      .join('\n');

    const text =
      `💾 *Kunlik hisobot — ${company?.name}* ${this.tag(info.slug, 'REPORT')}\n` +
      `📅 ${new Date().toLocaleDateString('uz-UZ')}\n\n` +
      `📦 Bugungi buyurtmalar: *${todayOrders}* (jami: ${totalOrders})\n` +
      `💰 Bugungi tushum: *${(todayRevenue._sum.totalAmount ?? 0).toLocaleString()} so'm*\n` +
      `⏳ Kutilayotgan: *${pendingOrders}* ta\n` +
      `👥 Faol dilerlar: *${totalDealers}*\n` +
      (lowStockLines
        ? `\n🔴 *Kam qolgan mahsulotlar:*\n${lowStockLines}`
        : '\n✅ Omborda yetarli');

    await this.send(info.token, info.logChatId, text);
  }
}
