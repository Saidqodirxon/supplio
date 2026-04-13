import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { NotificationService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { Request } from "express";
import { PlanLimitsService } from "../common/services/plan-limits.service";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    phone: string;
    companyId: string;
    roleType: string;
  };
  companyId: string;
}

@Controller("notifications")
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationsController {
  constructor(
    private readonly notifService: NotificationService,
    private readonly planLimits: PlanLimitsService
  ) {}

  private async ensureNotificationsAllowed(companyId: string) {
    await this.planLimits.checkFeatureAllowed(companyId, "allowNotifications");
  }

  /** Get current user's notifications */
  @Get()
  async getMyNotifications(
    @Req() req: AuthenticatedRequest,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    await this.ensureNotificationsAllowed(req.companyId);
    return this.notifService.getUserNotifications(
      req.user.id,
      req.companyId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20
    );
  }

  /** Get unread count */
  @Get("unread-count")
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    await this.ensureNotificationsAllowed(req.companyId);
    const count = await this.notifService.getUnreadCount(
      req.user.id,
      req.companyId
    );
    return { count };
  }

  /** Mark single notification as read */
  @Patch(":id/read")
  async markAsRead(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    await this.ensureNotificationsAllowed(req.companyId);
    await this.notifService.markAsRead(id, req.user.id);
    return { success: true };
  }

  /** Mark all as read */
  @Patch("read-all")
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    await this.ensureNotificationsAllowed(req.companyId);
    await this.notifService.markAllAsRead(req.user.id, req.companyId);
    return { success: true };
  }

  /** POST /notifications — send to a dealer (if receiverDealerId given) or broadcast to all company users */
  @Post()
  async createNotification(
    @Req() req: AuthenticatedRequest,
    @Body() body: { title: string; message: string; type?: string; receiverDealerId?: string }
  ) {
    await this.ensureNotificationsAllowed(req.companyId);
    if (body.receiverDealerId) {
      return this.notifService.createForDealer({
        companyId: req.companyId,
        senderId: req.user.id,
        receiverDealerId: body.receiverDealerId,
        title: body.title,
        message: body.message,
        type: body.type,
      });
    }
    return this.notifService.broadcastToCompany({
      companyId: req.companyId,
      senderId: req.user.id,
      title: body.title,
      message: body.message,
      type: body.type,
    });
  }

  /** Send notification to a user in the company (managers+) */
  @Post("send")
  async sendToUser(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      receiverUserId: string;
      title: string;
      message: string;
      type?: string;
    }
  ) {
    await this.ensureNotificationsAllowed(req.companyId);
    return this.notifService.createForUser({
      companyId: req.companyId,
      senderId: req.user.id,
      receiverUserId: body.receiverUserId,
      title: body.title,
      message: body.message,
      type: body.type,
    });
  }

  /** Broadcast to all users in company */
  @Post("broadcast")
  async broadcast(
    @Req() req: AuthenticatedRequest,
    @Body() body: { title: string; message: string; type?: string }
  ) {
    await this.ensureNotificationsAllowed(req.companyId);
    return this.notifService.broadcastToCompany({
      companyId: req.companyId,
      senderId: req.user.id,
      title: body.title,
      message: body.message,
      type: body.type,
    });
  }

  // ── TEMPLATES ──────────────────────────────────────────────────

  @Get("templates")
  async getTemplates(@Req() req: AuthenticatedRequest) {
    await this.ensureNotificationsAllowed(req.companyId);
    return this.notifService.getTemplates(req.companyId);
  }

  @Post("templates")
  async createTemplate(
    @Req() req: AuthenticatedRequest,
    @Body() body: { name: string; type: string; message: Record<string, string>; isActive?: boolean }
  ) {
    await this.ensureNotificationsAllowed(req.companyId);
    return this.notifService.createTemplate(req.companyId, body);
  }

  @Patch("templates/:id")
  async updateTemplate(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: { name?: string; type?: string; message?: Record<string, string>; isActive?: boolean }
  ) {
    await this.ensureNotificationsAllowed(req.companyId);
    return this.notifService.updateTemplate(req.companyId, id, body);
  }

  @Delete("templates/:id")
  async deleteTemplate(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    await this.ensureNotificationsAllowed(req.companyId);
    return this.notifService.deleteTemplate(req.companyId, id);
  }

  @Get("templates/logs")
  async getTemplateLogs(
    @Req() req: AuthenticatedRequest,
    @Query("templateId") templateId?: string
  ) {
    await this.ensureNotificationsAllowed(req.companyId);
    return this.notifService.getTemplateLogs(req.companyId, templateId);
  }
}
