import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  private static readonly DEMO_PHONE = "+998901000000";

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(phone: string, pass: string, isDemoRequest = false) {
    if (isDemoRequest && phone !== AuthService.DEMO_PHONE) {
      throw new UnauthorizedException(
        `Demo rejimda faqat ${AuthService.DEMO_PHONE} bilan kirish mumkin`
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        company: {
          select: { subscriptionStatus: true, trialExpiresAt: true },
        },
      },
    });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      if (!user.isActive) {
        throw new UnauthorizedException("User is deactivated");
      }

      const companyExpired =
        !!user.company?.trialExpiresAt &&
        ["TRIAL", "ACTIVE"].includes(
          String(user.company?.subscriptionStatus || "")
        ) &&
        new Date() > new Date(user.company.trialExpiresAt);

      if (
        user.roleType !== "SUPER_ADMIN" &&
        (user.company?.subscriptionStatus === "LOCKED" || companyExpired)
      ) {
        throw new UnauthorizedException(
          "Subscription expired or account locked"
        );
      }

      const payload = {
        sub: user.id,
        phone: user.phone,
        companyId: user.companyId,
        branchId: user.branchId,
        roleType: user.roleType,
      };

      return {
        token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          phone: user.phone,
          roleType: user.roleType,
          companyId: user.companyId,
        },
      };
    }

    throw new UnauthorizedException("Invalid credentials");
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        photoUrl: true,
        roleType: true,
        isActive: true,
        language: true,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { fullName?: string; photoUrl?: string; language?: string }
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        photoUrl: data.photoUrl,
        language: data.language,
      },
    });
  }

  async changePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string }
  ) {
    if (!data.currentPassword || !data.newPassword) {
      throw new BadRequestException(
        "Both current and new passwords are required"
      );
    }

    if (data.newPassword.length < 6) {
      throw new BadRequestException(
        "New password must be at least 6 characters"
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (
      !user ||
      !(await bcrypt.compare(data.currentPassword, user.passwordHash))
    ) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  }

  async requestPasswordReset(userId: string, data?: { note?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: { select: { name: true, slug: true } } },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const existing = await this.prisma.lead.findFirst({
      where: {
        phone: user.phone,
        status: "NEW",
        info: { contains: "PASSWORD_RESET_REQUEST" },
      },
    });

    if (existing) {
      return { success: true, alreadyRequested: true };
    }

    const infoLines = [
      "PASSWORD_RESET_REQUEST",
      `Company: ${user.company?.name || "-"}`,
      `Slug: ${user.company?.slug || "-"}`,
      `User: ${user.fullName || user.phone}`,
      `Role: ${user.roleType}`,
    ];

    if (data?.note?.trim()) {
      infoLines.push(`Note: ${data.note.trim()}`);
    }

    await this.prisma.lead.create({
      data: {
        fullName: user.fullName || `Password reset request`,
        phone: user.phone,
        info: infoLines.join(" | "),
      },
    });

    return { success: true };
  }
}
