// Payments Zod Schemas

import { z } from 'zod';

/**
 * Initialize payment schema
 */
export const initializePaymentSchema = z.object({
    orderId: z.string().uuid('Invalid order ID'),
});

export type InitializePaymentDto = z.infer<typeof initializePaymentSchema>;

/**
 * Webhook payload schema (OPay callback)
 */
export const opayWebhookSchema = z.object({
    orderId: z.string(),
    reference: z.string(),
    status: z.enum(['SUCCESS', 'FAILED', 'PENDING']),
    amount: z.number(),
    currency: z.string(),
    signature: z.string().optional(),
});

export type OPayWebhookDto = z.infer<typeof opayWebhookSchema>;

/**
 * List payments query schema
 */
export const listPaymentsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
    orderId: z.string().uuid().optional(),
});

export type ListPaymentsQueryDto = z.infer<typeof listPaymentsQuerySchema>;
