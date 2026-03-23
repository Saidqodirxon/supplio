import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Param,
  Query,
  Request,
} from "@nestjs/common";
import { SuperAdminService } from "./super-admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { BackupService } from "../common/services/backup/backup.service";
import { UnitsService } from "../units/units.service";

@Controller("super")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuperAdminController {
  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly backupService: BackupService,
    private readonly unitsService: UnitsService,
  ) {}

  // ── Backups ───────────────────────────────────────────────────────────────

  @Get("backups")
  @Roles("SUPER_ADMIN")
  async getBackups() {
    return this.backupService.listBackups();
  }

  @Post("backups/trigger")
  @Roles("SUPER_ADMIN")
  async triggerBackup() {
    return this.backupService.createBackup();
  }

  @Post("backups/send")
  @Roles("SUPER_ADMIN")
  async sendBackupToTelegram() {
    return this.backupService.createBackupAndSend();
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  @Get("settings")
  @Roles("SUPER_ADMIN")
  async getSettings() {
    return this.superAdminService.getGlobalSettings();
  }

  @Patch("settings")
  @Roles("SUPER_ADMIN")
  async updateSettings(@Body() body: any) {
    return this.superAdminService.updateGlobalSettings(body);
  }

  @Post("patch-data")
  @Roles("SUPER_ADMIN")
  async directUpdate(
    @Body() body: { model: string; id: string; field: string; value: any }
  ) {
    return this.superAdminService.directUpdate(body.model, body.id, body.field, body.value);
  }

  @Post("fix-users")
  @Roles("SUPER_ADMIN")
  async fixUsers() {
    return this.superAdminService.fixUsers();
  }

  // ── Company Management ────────────────────────────────────────────────────

  @Get("companies")
  @Roles("SUPER_ADMIN")
  async getCompanies(
    @Query("search") search?: string,
    @Query("plan") plan?: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.superAdminService.getAllCompanies({
      search,
      plan,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get("companies/:id")
  @Roles("SUPER_ADMIN")
  async getCompany(@Param("id") id: string) {
    return this.superAdminService.getCompanyById(id);
  }

  @Patch("companies/:id")
  @Roles("SUPER_ADMIN")
  async updateCompany(@Param("id") id: string, @Body() body: any) {
    return this.superAdminService.updateCompany(id, body);
  }

  @Delete("companies/:id")
  @Roles("SUPER_ADMIN")
  async deleteCompany(@Param("id") id: string, @Request() req: any) {
    return this.superAdminService.deleteCompany(id, req.user.id);
  }

  @Patch("companies/:id/plan")
  @Roles("SUPER_ADMIN")
  async setCompanyPlan(
    @Param("id") id: string,
    @Body() body: { plan: string; status: string }
  ) {
    return this.superAdminService.setCompanyPlan(id, body.plan, body.status);
  }

  @Patch("company/:id/status")
  @Roles("SUPER_ADMIN")
  async setCompanyStatus(@Param("id") id: string, @Body() body: { status: string }) {
    return this.superAdminService.setCompanyStatus(id, body.status);
  }

  // ── News ──────────────────────────────────────────────────────────────────

  @Get("news")
  @Roles("SUPER_ADMIN")
  async getNews() {
    return this.superAdminService.getAllNews();
  }

  @Post("news")
  @Roles("SUPER_ADMIN")
  async createNews(@Request() req: any, @Body() body: any) {
    return this.superAdminService.createNews(req.user.id, body);
  }

  @Patch("news/:id")
  @Roles("SUPER_ADMIN")
  async updateNews(@Param("id") id: string, @Body() body: any) {
    return this.superAdminService.updateNews(id, body);
  }

  @Delete("news/:id")
  @Roles("SUPER_ADMIN")
  async deleteNews(@Param("id") id: string) {
    return this.superAdminService.deleteNews(id);
  }

  @Post("news/seed")
  @Roles("SUPER_ADMIN")
  async seedNews() {
    return this.superAdminService.seedNews();
  }

  // ── Broadcast ─────────────────────────────────────────────────────────────

  @Post("broadcast")
  @Roles("SUPER_ADMIN")
  async broadcast(
    @Body() body: { title: string; message: string; targetPlan?: string }
  ) {
    return this.superAdminService.broadcast(body);
  }

  // ── Distributor Management ────────────────────────────────────────────────

  @Get("distributors")
  @Roles("SUPER_ADMIN")
  async getDistributors(
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.superAdminService.getDistributors({
      search,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Post("distributors")
  @Roles("SUPER_ADMIN")
  async createDistributor(
    @Body() body: {
      companyName: string;
      slug: string;
      phone: string;
      fullName?: string;
      password: string;
      subscriptionPlan?: string;
      trialDays?: number;
    }
  ) {
    return this.superAdminService.createDistributor(body);
  }

  // ── Notify Distributors ───────────────────────────────────────────────────

  @Post("notify-distributors")
  @Roles("SUPER_ADMIN")
  async notifyDistributors(
    @Body() body: {
      title: string;
      message: string;
      type?: string;
      companyIds?: string[];
    }
  ) {
    return this.superAdminService.notifyDistributors(body);
  }

  // ── Tariffs ───────────────────────────────────────────────────────────────

  @Get("tariffs")
  @Roles("SUPER_ADMIN")
  async getTariffs() {
    return this.superAdminService.getAllTariffs();
  }

  @Post("tariffs")
  @Roles("SUPER_ADMIN")
  async createTariff(@Body() body: any) {
    return this.superAdminService.createTariff(body);
  }

  @Patch("tariffs/:id")
  @Roles("SUPER_ADMIN")
  async updateTariff(@Param("id") id: string, @Body() body: any) {
    return this.superAdminService.updateTariff(id, body);
  }

  @Delete("tariffs/:id")
  @Roles("SUPER_ADMIN")
  async deleteTariff(@Param("id") id: string) {
    return this.superAdminService.deleteTariff(id);
  }

  @Post("tariffs/seed")
  @Roles("SUPER_ADMIN")
  async seedTariffs() {
    return this.superAdminService.seedDefaultTariffs();
  }

  @Post("units/seed")
  @Roles("SUPER_ADMIN")
  async seedUnits() {
    await this.unitsService.seedDefaults();
    return { message: "Default units seeded" };
  }

  // ── Audit Logs ────────────────────────────────────────────────────────────

  @Get("audit-logs")
  @Roles("SUPER_ADMIN")
  async getAuditLogs(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("userId") userId?: string
  ) {
    return this.superAdminService.getAuditLogs({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      userId,
    });
  }

  // ── Leads ─────────────────────────────────────────────────────────────────

  @Get("leads")
  @Roles("SUPER_ADMIN")
  async getLeads(
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.superAdminService.getLeads({
      status,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Patch("leads/:id")
  @Roles("SUPER_ADMIN")
  async updateLead(@Param("id") id: string, @Body() body: { status?: string; info?: string }) {
    return this.superAdminService.updateLead(id, body);
  }

  @Delete("leads/:id")
  @Roles("SUPER_ADMIN")
  async deleteLead(@Param("id") id: string) {
    return this.superAdminService.deleteLead(id);
  }

  // ── Feature Flags ─────────────────────────────────────────────────────────

  @Get("features")
  @Roles("SUPER_ADMIN")
  async getFeatures() {
    return this.superAdminService.getAllFeatures();
  }

  @Post("features")
  @Roles("SUPER_ADMIN")
  async toggleFeature(
    @Body() body: { companyId?: string; featureKey: string; isEnabled: boolean }
  ) {
    return this.superAdminService.setFeature(body);
  }

  // ── Landing CMS ───────────────────────────────────────────────────────────

  @Get("landing")
  @Roles("SUPER_ADMIN")
  async getLandingContent() {
    return this.superAdminService.getLandingContent();
  }

  @Patch("landing")
  @Roles("SUPER_ADMIN")
  async updateLandingContent(@Body() body: any) {
    return this.superAdminService.updateLandingContent(body);
  }

  // ── Metrics & Release Notes ───────────────────────────────────────────────

  @Get("metrics")
  @Roles("SUPER_ADMIN")
  async getMetrics() {
    return this.superAdminService.getServerMetrics();
  }

  @Get("release-notes")
  @Roles("SUPER_ADMIN")
  async getReleaseNotes() {
    return this.superAdminService.getReleaseNotes();
  }

  @Post("release-notes")
  @Roles("SUPER_ADMIN")
  async createReleaseNote(@Body() body: { version: string; title: string; content: string }) {
    return this.superAdminService.createReleaseNote(body);
  }

  @Delete("release-notes/:id")
  @Roles("SUPER_ADMIN")
  async deleteReleaseNote(@Param("id") id: string) {
    return this.superAdminService.deleteReleaseNote(id);
  }
}
