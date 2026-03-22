import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Delete,
  Param,
  Query,
} from "@nestjs/common";
import { ProductsService, ProductQuery } from "./products.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("products")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async create(@Req() req: any, @Body() body: any) {
    return this.productsService.create(req.companyId, body);
  }

  @Get()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY")
  async findAll(@Req() req: any, @Query() query: ProductQuery) {
    return this.productsService.findAll(req.companyId, query);
  }

  @Get("stats")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async getStats(@Req() req: any) {
    return this.productsService.getStats(req.companyId);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY")
  async findOne(@Req() req: any, @Param("id") id: string) {
    return this.productsService.findOne(id, req.companyId);
  }

  @Patch(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async update(@Req() req: any, @Param("id") id: string, @Body() body: any) {
    return this.productsService.update(id, req.companyId, body);
  }

  @Patch(":id/stock")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES")
  async updateStock(
    @Req() req: any,
    @Param("id") id: string,
    @Body("stock") stock: number
  ) {
    return this.productsService.updateStock(id, req.companyId, stock);
  }

  @Patch(":id/restore")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async restore(@Req() req: any, @Param("id") id: string) {
    return this.productsService.restore(id, req.companyId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async remove(@Req() req: any, @Param("id") id: string) {
    return this.productsService.remove(id, req.companyId, req.user?.id || "system");
  }
}
