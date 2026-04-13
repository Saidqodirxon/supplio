import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "secretKey",
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        company: {
          select: { subscriptionStatus: true, trialExpiresAt: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const companyExpired =
      !!user.company?.trialExpiresAt &&
      ["TRIAL", "ACTIVE"].includes(String(user.company?.subscriptionStatus || "")) &&
      new Date() > new Date(user.company.trialExpiresAt);

    if (
      user.roleType !== "SUPER_ADMIN" &&
      (user.company?.subscriptionStatus === "LOCKED" || companyExpired)
    ) {
      throw new UnauthorizedException("Subscription expired or account locked");
    }

    return {
      id: user.id,
      phone: user.phone,
      companyId: user.companyId,
      branchId: user.branchId,
      roleType: user.roleType,
    };
  }
}
