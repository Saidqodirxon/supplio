import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
// Note: In a real app we import Auth service and extract token
// For example: authService.verifyToken(token)

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request | any, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Decode mock Token and extract user claims mapping directly
      // In Production: JWT verify happens here
      // req.user = verified payload mapping: { id, companyId, branchId, role };
      req.user = {
        id: "mock-user-id",
        companyId: req.headers["x-mock-company-id"],
        role: req.headers["x-mock-role"] || "OWNER",
      };
    }
    next();
  }
}
