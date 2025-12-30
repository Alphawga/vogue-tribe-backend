// Custom decorators

import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { RequestUser } from '../types';

/**
 * Get the current authenticated user from the request
 */
export const CurrentUser = createParamDecorator(
    (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as RequestUser;

        return data ? user?.[data] : user;
    },
);

/**
 * Mark an endpoint as public (no authentication required)
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Set required roles for an endpoint
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
