"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DemoController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoController = void 0;
const common_1 = require("@nestjs/common");
const demo_service_1 = require("./demo.service");
let DemoController = DemoController_1 = class DemoController {
    constructor(demoService) {
        this.demoService = demoService;
        this.logger = new common_1.Logger(DemoController_1.name);
    }
    async triggerReset() {
        this.logger.log("Manual demo reset triggered");
        await this.demoService.handleDailyReset();
        return { success: true, message: "Demo environment reset complete" };
    }
    async getStatus() {
        return {
            active: true,
            environment: "demo",
            resetSchedule: "Daily at midnight",
            lastReset: new Date().toISOString(),
        };
    }
    async getDemoData() {
        return this.demoService.getDemoData();
    }
    async requestDemoAccess(body) {
        return this.demoService.requestDemoAccess(body);
    }
    async getDemoNews() {
        return this.demoService.getDemoNews();
    }
    async getDemoTariffs() {
        return this.demoService.getDemoTariffs();
    }
    async getDemoStores() {
        return this.demoService.getDemoStores();
    }
};
exports.DemoController = DemoController;
__decorate([
    (0, common_1.Post)("reset"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "triggerReset", null);
__decorate([
    (0, common_1.Get)("status"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)("data"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getDemoData", null);
__decorate([
    (0, common_1.Post)("access"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "requestDemoAccess", null);
__decorate([
    (0, common_1.Get)("news"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getDemoNews", null);
__decorate([
    (0, common_1.Get)("tariffs"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getDemoTariffs", null);
__decorate([
    (0, common_1.Get)("stores"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getDemoStores", null);
exports.DemoController = DemoController = DemoController_1 = __decorate([
    (0, common_1.Controller)("demo"),
    __metadata("design:paramtypes", [demo_service_1.DemoService])
], DemoController);
//# sourceMappingURL=demo.controller.js.map