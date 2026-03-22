import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("categories")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ── Categories ────────────────────────────────────────────────────────────

  @Get()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY")
  async findAll(@Req() req: any) {
    return this.categoriesService.findAllCategories(req.companyId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async create(@Req() req: any, @Body("name") name: string) {
    return this.categoriesService.createCategory(req.companyId, name);
  }

  @Patch(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async update(
    @Req() req: any,
    @Param("id") id: string,
    @Body("name") name: string
  ) {
    return this.categoriesService.updateCategory(id, req.companyId, name);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async remove(@Req() req: any, @Param("id") id: string) {
    return this.categoriesService.removeCategory(
      id,
      req.companyId,
      req.user?.id || "system"
    );
  }

  @Patch(":id/restore")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async restore(@Req() req: any, @Param("id") id: string) {
    return this.categoriesService.restoreCategory(id, req.companyId);
  }

  // ── Subcategories ─────────────────────────────────────────────────────────

  @Post(":categoryId/subcategories")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async createSubcategory(
    @Req() req: any,
    @Param("categoryId") categoryId: string,
    @Body("name") name: string
  ) {
    return this.categoriesService.createSubcategory(
      req.companyId,
      categoryId,
      name
    );
  }

  @Patch("subcategories/:id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async updateSubcategory(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { name?: string; categoryId?: string }
  ) {
    return this.categoriesService.updateSubcategory(id, req.companyId, body);
  }

  @Delete("subcategories/:id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async removeSubcategory(@Req() req: any, @Param("id") id: string) {
    return this.categoriesService.removeSubcategory(
      id,
      req.companyId,
      req.user?.id || "system"
    );
  }

  @Patch("subcategories/:id/restore")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async restoreSubcategory(@Req() req: any, @Param("id") id: string) {
    return this.categoriesService.restoreSubcategory(id, req.companyId);
  }
}
