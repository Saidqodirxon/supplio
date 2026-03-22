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

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // SuperAdmin Bypassing
    if (user.roleType === RoleType.SUPER_ADMIN) return true;

    // Static Role Check
    if (requiredRoles && requiredRoles.includes(user.roleType)) return true;

    // Dynamic Permission Check (Custom Roles)
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
      "SEC_ERR: You do not have sufficient permissions to perform this action."
    );
  }
}
