import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

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
      this.prisma.systemSettings.findUnique({
        where: { id: "GLOBAL" },
        select: {
          newsEnabled: true,
          systemVersion: true,
          maintenanceMode: true,
          superAdminPhone: true,
        },
      }),
      (this.prisma as any).landingContent
        .findUnique({ where: { id: "LANDING" } })
        .catch(() => null),
    ]);

    return { news, tariffs, settings, landing };
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

    return {
      testimonials,
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
