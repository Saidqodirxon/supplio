import {
  Injectable,
  NestMiddleware,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: any, res: any, next: () => void) {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ maintenanceMode: boolean | null }>>(
      `SELECT "maintenanceMode"
       FROM "SystemSettings"
       WHERE id = 'GLOBAL'
       LIMIT 1`
    );
    const settings = rows[0] ?? null;

    if (settings?.maintenanceMode) {
      // Allow SuperAdmins even in maintenance mode if needed
      if (req.user?.roleType === "SUPER_ADMIN") {
        return next();
      }
      throw new ServiceUnavailableException({
        statusCode: 503,
        message:
          "System is currently undergoing maintenance. Please try again shortly.",
        error: "MAINTENANCE_MODE",
      });
    }

    next();
  }
}
