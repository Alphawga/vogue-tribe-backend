// Response transformation interceptor

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types';

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((data) => {
                // If data is already in ApiResponse format, return as is
                if (data && typeof data === 'object' && 'success' in data) {
                    return data;
                }

                // Otherwise wrap in success response
                return {
                    success: true,
                    data,
                    message: 'Success',
                };
            }),
        );
    }
}
