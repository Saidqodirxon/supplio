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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FeatureFlagService = class FeatureFlagService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async isEnabled(companyId, featureKey) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            include: { featureFlags: { where: { featureKey } } },
        });
        if (!company)
            return false;
        if (company.featureFlags.length > 0) {
            return company.featureFlags[0].isEnabled;
        }
        const planDefault = await this.prisma.featureFlag.findFirst({
            where: { featureKey, companyId: null },
        });
        if (planDefault && planDefault.planLevel) {
            return this._matchesPlan(company.subscriptionPlan, planDefault.planLevel);
        }
        return planDefault?.isEnabled || false;
    }
    _matchesPlan(current, required) {
        const weights = {
            [client_1.SubscriptionPlan.FREE]: 0,
            [client_1.SubscriptionPlan.START]: 1,
            [client_1.SubscriptionPlan.PRO]: 2,
            [client_1.SubscriptionPlan.PREMIUM]: 3,
        };
        return weights[current] >= weights[required];
    }
};
exports.FeatureFlagService = FeatureFlagService;
exports.FeatureFlagService = FeatureFlagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeatureFlagService);
//# sourceMappingURL=feature-flag.service.js.map