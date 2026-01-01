// Shared Zod schemas for common validation patterns

import { z } from 'zod';
import { APP_CONSTANTS } from '../constants';

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
    page: z.coerce
        .number()
        .int('Page must be an integer')
        .min(1, 'Page must be at least 1')
        .default(APP_CONSTANTS.DEFAULT_PAGE),
    limit: z.coerce
        .number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(APP_CONSTANTS.MAX_LIMIT, `Limit cannot exceed ${APP_CONSTANTS.MAX_LIMIT}`)
        .default(APP_CONSTANTS.DEFAULT_LIMIT),
});

export type PaginationDto = z.infer<typeof paginationSchema>;

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
    id: uuidSchema,
});

export type IdParamDto = z.infer<typeof idParamSchema>;

/**
 * Slug parameter schema
 */
export const slugParamSchema = z.object({
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
});

export type SlugParamDto = z.infer<typeof slugParamSchema>;

/**
 * Single slug validation schema
 */
export const slugSchema = z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format');

