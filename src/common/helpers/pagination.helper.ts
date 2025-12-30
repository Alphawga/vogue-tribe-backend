// Pagination helper functions

import { PaginatedResult, PaginationMeta } from '../types';

/**
 * Calculate skip and take values for database pagination
 */
export function calculatePagination(
    page: number,
    limit: number,
): { skip: number; take: number } {
    return {
        skip: (page - 1) * limit,
        take: limit,
    };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
    total: number,
    page: number,
    limit: number,
): PaginationMeta {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Create a paginated response with items and metadata
 */
export function createPaginatedResult<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
): PaginatedResult<T> {
    return {
        items,
        meta: createPaginationMeta(total, page, limit),
    };
}
