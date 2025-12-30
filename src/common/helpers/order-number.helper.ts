// Order number generation helper

import { APP_CONSTANTS } from '../constants';

/**
 * Generate a unique order number
 * Format: VT-{TIMESTAMP_BASE36}-{RANDOM}
 * Example: VT-M5XK9P2-A3B7
 */
export function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${APP_CONSTANTS.ORDER_PREFIX}-${timestamp}-${random}`;
}

/**
 * Generate a unique reference for payments
 * Format: PAY-{TIMESTAMP}-{RANDOM}
 */
export function generatePaymentReference(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${timestamp}-${random}`;
}

/**
 * Generate a unique SKU for product variants
 * Format: SKU-{PRODUCT_INITIAL}-{COLOR}-{SIZE}-{RANDOM}
 */
export function generateSKU(
    productName: string,
    color: string,
    size: string,
): string {
    const productInitial = productName.substring(0, 3).toUpperCase();
    const colorCode = color.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SKU-${productInitial}-${colorCode}-${size.toUpperCase()}-${random}`;
}
