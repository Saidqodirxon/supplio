"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalErrorInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalErrorInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let GlobalErrorInterceptor = GlobalErrorInterceptor_1 = class GlobalErrorInterceptor {
    constructor() {
        this.logger = new common_1.Logger(GlobalErrorInterceptor_1.name);
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.catchError)((error) => {
            const request = context.switchToHttp().getRequest();
            const { user, url, method } = request;
            const status = error instanceof common_1.HttpException
                ? error.getStatus()
                : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const response = error.response || {};
            const message = response.message || error.message || "Internal server error";
            this.logger.error(`[${method}] ${url} | Status: ${status} | User: ${user?.id || "Guest"} | Msg: ${message}`, error.stack);
            return (0, rxjs_1.throwError)(() => new common_1.HttpException({
                statusCode: status,
                message: message,
                timestamp: new Date().toISOString(),
                path: url,
            }, status));
        }));
    }
};
exports.GlobalErrorInterceptor = GlobalErrorInterceptor;
exports.GlobalErrorInterceptor = GlobalErrorInterceptor = GlobalErrorInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], GlobalErrorInterceptor);
//# sourceMappingURL=error.interceptor.js.map