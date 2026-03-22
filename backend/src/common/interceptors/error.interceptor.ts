import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class GlobalErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GlobalErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const { user, url, method } = request;

        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const response = error.response || {};
        const message =
          response.message || error.message || "Internal server error";

        this.logger.error(
          `[${method}] ${url} | Status: ${status} | User: ${user?.id || "Guest"} | Msg: ${message}`,
          error.stack
        );

        // Sanitize error response for production
        return throwError(
          () =>
            new HttpException(
              {
                statusCode: status,
                message: message,
                timestamp: new Date().toISOString(),
                path: url,
              },
              status
            )
        );
      })
    );
  }
}
