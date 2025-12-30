// Users Zod Schemas

import { z } from 'zod';
import { addressSchema, updateAddressSchema } from '../../../common/schemas';

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
    firstName: z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name cannot exceed 50 characters')
        .trim()
        .optional(),
    lastName: z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name cannot exceed 50 characters')
        .trim()
        .optional(),
    phone: z
        .string()
        .regex(
            /^(\+234|0)[789][01]\d{8}$/,
            'Please enter a valid Nigerian phone number',
        )
        .optional()
        .nullable(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

/**
 * Create address schema (re-export from common)
 */
export const createAddressSchema = addressSchema;
export type CreateAddressDto = z.infer<typeof createAddressSchema>;

/**
 * Update address schema (re-export from common)
 */
export { updateAddressSchema };
export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;

/**
 * Admin: Update user status schema
 */
export const updateUserStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;

/**
 * Admin: List users query schema
 */
export const listUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
    role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).optional(),
});

export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;
