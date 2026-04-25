import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("GlobalExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const raw =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : ((exceptionResponse as Record<string, unknown>).message as string) ||
            exception.message;
      message = Array.isArray(raw) ? raw[0] : raw;
    } else if (exception instanceof Error) {
      message = exception.message;
      // Map well-known internal error prefixes to proper HTTP status codes
      if (message.startsWith("DEMO_LIMIT:")) {
        status = HttpStatus.PAYMENT_REQUIRED;
        message = message.replace("DEMO_LIMIT:", "").trim();
      } else if (message.startsWith("FREE_QUOTA_EXCEEDED:")) {
        status = HttpStatus.PAYMENT_REQUIRED;
        message = message.replace("FREE_QUOTA_EXCEEDED:", "").trim();
      }
    }

    // Try-catch logging to prevent filter itself from crashing
    try {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status} - ${JSON.stringify(message)}`
      );
      
      if (status >= 500) {
        console.error('Fatal Exception:', exception);
      }
    } catch (logError) {
      console.error('Error in Exception Filter logging:', logError);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
