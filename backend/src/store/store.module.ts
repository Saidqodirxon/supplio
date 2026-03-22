import { Module } from "@nestjs/common";
import { StoreController } from "./store.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [StoreController],
})
export class StoreModule {}
