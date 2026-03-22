import { SetMetadata } from "@nestjs/common";
import { RoleType } from "@prisma/client";

export const Roles = (...roles: RoleType[]) => SetMetadata("roles", roles);
export const Permissions = (...permissions: string[]) =>
  SetMetadata("permissions", permissions);
