// Cart Zod Schemas

import { z } from 'zod';

/**
 * Add item to cart schema
 */
export const addCartItemSchema = z.object({
    variantId: z.string().uuid('Invalid variant ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export type AddCartItemDto = z.infer<typeof addCartItemSchema>;

/**
 * Update cart item quantity schema
 */
export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;

/**
 * Apply coupon schema
 */
export const applyCouponSchema = z.object({
    code: z.string().min(1, 'Coupon code is required').toUpperCase(),
});

export type ApplyCouponDto = z.infer<typeof applyCouponSchema>;
