import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  private async loadGlobalSettings() {
    try {
      const rows = await this.prisma.$queryRawUnsafe<
        Array<{
          newsEnabled: boolean | null;
          systemVersion: string | null;
          maintenanceMode: boolean | null;
          superAdminPhone: string | null;
          termsUz: string | null;
          termsRu: string | null;
          termsEn: string | null;
          termsUzCyr: string | null;
          privacyUz: string | null;
          privacyRu: string | null;
          privacyEn: string | null;
          privacyUzCyr: string | null;
          contractUz: string | null;
          contractRu: string | null;
          contractEn: string | null;
          contractUzCyr: string | null;
          updatedAt: Date | string | null;
        }>
      >(
        `SELECT
          "newsEnabled",
          "systemVersion",
          "maintenanceMode",
          "superAdminPhone",
          "termsUz",
          "termsRu",
          "termsEn",
          "termsUzCyr",
          "privacyUz",
          "privacyRu",
          "privacyEn",
          "privacyUzCyr",
          "contractUz",
          "contractRu",
          "contractEn",
          "contractUzCyr",
          "updatedAt"
        FROM "SystemSettings"
        WHERE id = 'GLOBAL'
        LIMIT 1`
      );
      return rows[0] ?? null;
    } catch {
      return null;
    }
  }

  async getHomeData() {
    const [news, tariffs, settings, landing] = await Promise.all([
      (this.prisma as any).news.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          slugUz: true,
          slugRu: true,
          slugEn: true,
          slugTr: true,
          slugUzCyr: true,
          titleUz: true,
          titleRu: true,
          titleEn: true,
          titleTr: true,
          titleUzCyr: true,
          excerptUz: true,
          excerptRu: true,
          excerptEn: true,
          excerptTr: true,
          excerptUzCyr: true,
          image: true,
          createdAt: true,
        },
      }),
      (this.prisma as any).tariffPlan.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      this.loadGlobalSettings(),
      (this.prisma as any).landingContent
        .findUnique({ where: { id: "LANDING" } })
        .catch(() => null),
    ]);

    return { news, tariffs, settings, landing };
  }

  async getNewsList(_lang: string, limit: number = 20) {
    const take = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20;
    return (this.prisma as any).news.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        slugUz: true,
        slugRu: true,
        slugEn: true,
        slugTr: true,
        slugUzCyr: true,
        titleUz: true,
        titleRu: true,
        titleEn: true,
        titleTr: true,
        titleUzCyr: true,
        excerptUz: true,
        excerptRu: true,
        excerptEn: true,
        excerptTr: true,
        excerptUzCyr: true,
        image: true,
        createdAt: true,
        viewCount: true,
      },
    });
  }

  async getTariffs() {
    return (this.prisma as any).tariffPlan.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  }

  async getContent() {
    // Use raw SQL for everything — avoids Prisma middleware on models not in client
    let testimonials: any[] = [];
    let companies = 0;
    let orders = 0;

    try {
      const rows = await this.prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
        `SELECT COUNT(*) as cnt FROM "Testimonial" WHERE "isActive" = true`
      );
      // Table exists, now fetch rows
      testimonials = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, name, company, "roleTitle", "contentUz", "contentRu", "contentEn", "contentTr", rating, avatar, "order" FROM "Testimonial" WHERE "isActive" = true ORDER BY "order" ASC`
      );
    } catch (_e) {
      testimonials = [];
    }

    try {
      const r1 = await this.prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
        `SELECT COUNT(*) as cnt FROM "Company" WHERE "deletedAt" IS NULL`
      );
      companies = Number(r1[0]?.cnt ?? 0);
    } catch (_e) {
      companies = 0;
    }

    try {
      const r2 = await this.prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
        `SELECT COUNT(*) as cnt FROM "Order"`
      );
      orders = Number(r2[0]?.cnt ?? 0);
    } catch (_e) {
      orders = 0;
    }

    let teamMembers: any[] = [];
    try {
      teamMembers = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, name, "roleUz", "roleRu", "roleEn", "roleTr", "bioUz", "bioRu", "bioEn", "bioTr", avatar, "order" FROM "TeamMember" WHERE "isActive" = true ORDER BY "order" ASC`
      );
    } catch (_e) {
      teamMembers = [];
    }

    return {
      testimonials,
      teamMembers,
      stats: {
        companies,
        orders,
        uptime: "99.9%",
        support: "24/7",
      },
    };
  }

  async getNewsBySlug(slug: string, lang: string) {
    const suffix =
      lang === "oz" ? "UzCyr" : lang.charAt(0).toUpperCase() + lang.slice(1);
    const slugField = `slug${suffix}`;
    return (this.prisma as any).news.findFirst({
      where: {
        [slugField]: slug,
        isPublished: true,
      },
      select: {
        id: true,
        slugUz: true,
        slugRu: true,
        slugEn: true,
        slugTr: true,
        slugUzCyr: true,
        titleUz: true,
        titleRu: true,
        titleEn: true,
        titleTr: true,
        titleUzCyr: true,
        excerptUz: true,
        excerptRu: true,
        excerptEn: true,
        excerptTr: true,
        excerptUzCyr: true,
        contentUz: true,
        contentRu: true,
        contentEn: true,
        contentTr: true,
        contentUzCyr: true,
        image: true,
        viewCount: true,
        isPublished: true,
        createdAt: true,
      },
    });
  }

  async getLegalContent(type: string, lang: string) {
    const suffix =
      lang === "oz" ? "UzCyr" : lang.charAt(0).toUpperCase() + lang.slice(1);
    const field = `${type}${suffix}`;
    const settings = await this.loadGlobalSettings();

    if (!settings) {
      return { type, lang, content: "", updatedAt: null };
    }

    const settingsRecord = settings as Record<string, unknown>;
    const getStringField = (key: string): string | undefined => {
      const value = settingsRecord[key];
      return typeof value === "string" ? value : undefined;
    };

    const content =
      getStringField(field) ||
      getStringField(`${type}En`) ||
      getStringField(`${type}Uz`);

    return {
      type,
      lang,
      content: typeof content === "string" ? content : "",
      updatedAt: settings.updatedAt,
    };
  }

  async incrementNewsView(id: string) {
    try {
      return await (this.prisma as any).news.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
        select: { id: true, viewCount: true },
      });
    } catch {
      // viewCount column may not exist yet — ignore until migration runs
      return { id, viewCount: 0 };
    }
  }
}
