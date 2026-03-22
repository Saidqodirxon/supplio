import { RoleType } from "@prisma/client";
export declare const Roles: (...roles: RoleType[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const Permissions: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
