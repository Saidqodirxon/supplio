import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Scope,
  Inject,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

/**
 * Enterprise Tenant Prisma Service
 *
 * Provides dynamic database connection per company (tenant).
 * Scoped to each Request for high security and performance.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantPrismaService implements OnModuleInit, OnModuleDestroy {
  private _client: PrismaClient | null = null;

  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async onModuleInit() {
    // Client is initialized lazily on get() call to save resources
  }

  get client(): PrismaClient {
    if (this._client) return this._client;

    const companyId = this.request.headers["x-company-id"] as string;

    // In a production environment, you would fetch this URL from the Main/Global DB
    // based on the companyId. For now, we use a fallback to demonstration.
    const dbUrl = process.env.DATABASE_URL?.replace(
      "supplio",
      `supplio_tenant_${companyId}`
    );

    this._client = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });

    // -------------------------------------------------------------------------
    // Enterprise Middleware for Tenant Data
    // -------------------------------------------------------------------------
    this._attachMiddleware(this._client);

    return this._client;
  }

  private _attachMiddleware(client: PrismaClient) {
    client.$use(async (params, next) => {
      // 1. Soft Delete Enforcement for all tenant models
      if (params.action === "delete") {
        params.action = "update";
        params.args["data"] = { deletedAt: new Date() };
      }
      if (params.action === "deleteMany") {
        params.action = "updateMany";
        if (params.args.data !== undefined) {
          params.args.data["deletedAt"] = new Date();
        } else {
          params.args["data"] = { deletedAt: new Date() };
        }
      }

      // 2. Automatic Filtering of Soft-Deleted data
      if (
        ["findUnique", "findFirst", "findMany", "count"].includes(params.action)
      ) {
        if (params.args.where) {
          if (params.args.where.deletedAt === undefined) {
            params.args.where["deletedAt"] = null;
          }
        } else {
          params.args["where"] = { deletedAt: null };
        }
      }

      return next(params);
    });
  }

  async onModuleDestroy() {
    if (this._client) {
      await this._client.$disconnect();
    }
  }
}
