"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const company_service_1 = require("./company.service");
describe('CompanyService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [company_service_1.CompanyService],
        }).compile();
        service = module.get(company_service_1.CompanyService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=company.service.spec.js.map