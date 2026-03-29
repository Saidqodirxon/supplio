import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: { headers?: Record<string, string> }
  ) {
    const demoHeader = String(req?.headers?.["x-supplio-demo"] || "").toLowerCase();
    const isDemoRequest = demoHeader === "true" || demoHeader === "1";
    return this.authService.login(loginDto.phone, loginDto.password, isDemoRequest);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req: { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() body: { fullName?: string; photoUrl?: string; language?: string }
  ) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("change-password")
  async changePassword(
    @Request() req: { user: { id: string } },
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    return this.authService.changePassword(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post("request-password-reset")
  async requestPasswordReset(
    @Request() req: { user: { id: string } },
    @Body() body?: { note?: string }
  ) {
    return this.authService.requestPasswordReset(req.user.id, body);
  }
}
