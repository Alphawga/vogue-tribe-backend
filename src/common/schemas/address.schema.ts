// Address validation schema

import { z } from 'zod';

export const addressSchema = z.object({
    firstName: z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name cannot exceed 50 characters'),
    lastName: z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name cannot exceed 50 characters'),
    phone: z
        .string()
        .regex(
            /^(\+234|0)[789][01]\d{8}$/,
            'Please enter a valid Nigerian phone number',
        ),
    street: z
        .string()
        .min(5, 'Street address must be at least 5 characters')
        .max(200, 'Street address cannot exceed 200 characters'),
    city: z
        .string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City cannot exceed 100 characters'),
    state: z
        .string()
        .min(2, 'State is required')
        .max(50, 'State cannot exceed 50 characters'),
    postalCode: z
        .string()
        .regex(/^\d{6}$/, 'Please enter a valid 6-digit postal code')
        .optional(),
    country: z.string().default('Nigeria'),
    isDefault: z.boolean().default(false),
});

export type AddressDto = z.infer<typeof addressSchema>;

export const updateAddressSchema = addressSchema.partial();

export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
