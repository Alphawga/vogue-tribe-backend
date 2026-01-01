// Orders Zod Schemas

import { z } from 'zod';

/**
 * Create order (checkout) schema
 */
export const createOrderSchema = z.object({
    addressId: z.string().uuid('Please select a shipping address'),
    notes: z.string().max(500).optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

/**
 * Update order status schema (admin)
 */
export const updateOrderStatusSchema = z.object({
    status: z.enum([
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
    ]),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;

/**
 * List orders query schema
 */
export const listOrdersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z
        .enum([
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
            'REFUNDED',
        ])
        .optional(),
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
});

export type ListOrdersQueryDto = z.infer<typeof listOrdersQuerySchema>;
