// Global exception filter for consistent error responses

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { MESSAGES } from '../constants';

interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string>;
    };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorResponse: ErrorResponse = {
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: MESSAGES.GENERAL.SERVER_ERROR,
            },
        };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse as Record<string, unknown>;

                // Check if it's already our custom format
                if (responseObj.success === false && responseObj.error) {
                    errorResponse = exceptionResponse as ErrorResponse;
                } else {
                    // Transform NestJS default error format
                    errorResponse = {
                        success: false,
                        error: {
                            code: this.getErrorCode(status),
                            message:
                                (responseObj.message as string) ||
                                exception.message ||
                                MESSAGES.GENERAL.SERVER_ERROR,
                            details: responseObj.errors as Record<string, string> | undefined,
                        },
                    };
                }
            } else {
                errorResponse = {
                    success: false,
                    error: {
                        code: this.getErrorCode(status),
                        message: exceptionResponse as string,
                    },
                };
            }
        }

        // Log the error
        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${errorResponse.error.message}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        response.status(status).json(errorResponse);
    }

    private getErrorCode(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return 'BAD_REQUEST';
            case HttpStatus.UNAUTHORIZED:
                return 'UNAUTHORIZED';
            case HttpStatus.FORBIDDEN:
                return 'FORBIDDEN';
            case HttpStatus.NOT_FOUND:
                return 'NOT_FOUND';
            case HttpStatus.CONFLICT:
                return 'CONFLICT';
            case HttpStatus.TOO_MANY_REQUESTS:
                return 'RATE_LIMITED';
            default:
                return 'INTERNAL_SERVER_ERROR';
        }
    }
}
