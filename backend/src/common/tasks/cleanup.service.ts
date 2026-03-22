import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSoftDeleteCleanup() {
    this.logger.log(
      "Starting soft-delete record cleanup (30-day retention)..."
    );

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
        const result = await (this.prisma as any)[model].deleteMany({
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        this.logger.error(`Failed to clean up ${model}: ${msg}`);
      }
    }

    this.logger.log(`Cleanup completed. Total records purged: ${totalDeleted}`);
  }
}
