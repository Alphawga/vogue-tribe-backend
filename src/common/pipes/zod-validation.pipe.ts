// Zod Validation Pipe for NestJS

import {
    PipeTransform,
    ArgumentMetadata,
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import type { ZodSchema, ZodIssue } from 'zod';
import { ZodError } from 'zod';
import { MESSAGES } from '../constants';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) { }

    transform(value: unknown, _metadata: ArgumentMetadata) {
        const result = this.schema.safeParse(value);

        if (!result.success) {
            const errors = this.formatErrors(result.error);
            throw new BadRequestException({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: MESSAGES.GENERAL.VALIDATION_FAILED,
                    details: errors,
                },
            });
        }

        return result.data;
    }

    private formatErrors(error: ZodError): Record<string, string> {
        const formatted: Record<string, string> = {};

        error.issues.forEach((issue: ZodIssue) => {
            const path = issue.path.join('.') || 'value';
            formatted[path] = issue.message;
        });

        return formatted;
    }
}

/**
 * Factory function to create a Zod validation pipe
 */
export function zodPipe(schema: ZodSchema): ZodValidationPipe {
    return new ZodValidationPipe(schema);
}
