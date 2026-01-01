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
 * Format: SKU-{CATEGORY_INITIAL}-{COLOR}-{SIZE}-{RANDOM}
 * Or for base product: SKU-{CATEGORY_INITIAL}-{RANDOM}
 */
export function generateSKU(categoryName: string): string;
export function generateSKU(categoryName: string, color: string, size: string): string;
export function generateSKU(
    categoryName: string,
    color?: string,
    size?: string,
): string {
    const categoryInitial = categoryName.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    if (color && size) {
        const colorCode = color.substring(0, 3).toUpperCase();
        return `SKU-${categoryInitial}-${colorCode}-${size.toUpperCase()}-${random}`;
    }

    return `SKU-${categoryInitial}-${random}`;
}

