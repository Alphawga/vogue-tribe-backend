// API Response builder helpers

import { ApiResponse, PaginatedResult } from '../types';
import { MESSAGES } from '../constants';

/**
 * Build a success response
 */
export function successResponse<T>(
    data: T,
    message: string = MESSAGES.GENERAL.SUCCESS,
): ApiResponse<T> {
    return {
        success: true,
        data,
        message,
    };
}

/**
 * Build a paginated response
 */
export function paginatedResponse<T>(
    result: PaginatedResult<T>,
    message: string = MESSAGES.GENERAL.SUCCESS,
): ApiResponse<T[]> {
    return {
        success: true,
        data: result.items,
        message,
        meta: result.meta,
    };
}

/**
 * Build a created response
 */
export function createdResponse<T>(
    data: T,
    message: string = MESSAGES.GENERAL.CREATED,
): ApiResponse<T> {
    return {
        success: true,
        data,
        message,
    };
}

/**
 * Build an updated response
 */
export function updatedResponse<T>(
    data: T,
    message: string = MESSAGES.GENERAL.UPDATED,
): ApiResponse<T> {
    return {
        success: true,
        data,
        message,
    };
}

/**
 * Build a deleted response
 */
export function deletedResponse(
    message: string = MESSAGES.GENERAL.DELETED,
): ApiResponse<null> {
    return {
        success: true,
        data: null,
        message,
    };
}
