import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(phone: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
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
}
