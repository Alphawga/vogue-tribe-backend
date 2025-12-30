// Shared TypeScript interfaces and types

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    meta?: PaginationMeta;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string>;
    };
}

export interface PaginatedResult<T> {
    items: T[];
    meta: PaginationMeta;
}

export interface JwtPayload {
    sub: string; // User ID
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface RequestUser {
    id: string;
    email: string;
    role: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

// Re-export enums for convenience
export * from './enums';
