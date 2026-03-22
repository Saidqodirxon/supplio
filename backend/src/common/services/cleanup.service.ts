import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {
    // Basic interval check (e.g. daily)
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
        // Using direct prisma raw or bypassing the middleware find
        // Actually we need a way to bypass soft-delete filter to actually find and delete these.
        // In Prisma Middleware we can check for a special flag if we want to bypass it.

        const deletedCount = await (
          this.prisma[model as any] as any
        ).deleteMany({
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
      } catch (err) {
        this.logger.error(`Failed to purge ${model}: ${err}`);
      }
    }
    this.logger.log("Purge complete.");
  }
}
