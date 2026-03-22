import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleType } from "@prisma/client";

/**
 * Enterprise Role & Permission Guard
 *
 * Supports both static RoleType and dynamic CustomRole permissions.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      "roles",
      [context.getHandler(), context.getClass()]
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      "permissions",
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles && !requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // 1. SuperAdmin bypass
    if (user.roleType === RoleType.SUPER_ADMIN) return true;

    // 2. Static Role Check
    if (requiredRoles && requiredRoles.includes(user.roleType)) return true;

    // 3. Dynamic Permission Check (Custom Roles)
    if (requiredPermissions && user.customRole?.permissions) {
      const userPermissions = user.customRole.permissions as Record<
        string,
        boolean
      >;
      const hasPermission = requiredPermissions.every(
        (p) => userPermissions[p] === true
      );
      if (hasPermission) return true;
    }

    throw new ForbiddenException(
      "FORBIDDEN: You do not have sufficient permissions to perform this action."
    );
  }
}
