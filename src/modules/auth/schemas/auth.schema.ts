// Auth Zod Schemas

import { z } from 'zod';

/**
 * Register schema
 */
export const registerSchema = z.object({
    email: z
        .string()
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        ),
    firstName: z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name cannot exceed 50 characters')
        .trim(),
    lastName: z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name cannot exceed 50 characters')
        .trim(),
    phone: z
        .string()
        .regex(
            /^(\+234|0)[789][01]\d{8}$/,
            'Please enter a valid Nigerian phone number',
        )
        .optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        ),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        ),
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
