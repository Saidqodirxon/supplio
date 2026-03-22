"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const company_controller_1 = require("./company.controller");
describe('CompanyController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [company_controller_1.CompanyController],
        }).compile();
        controller = module.get(company_controller_1.CompanyController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=company.controller.spec.js.map