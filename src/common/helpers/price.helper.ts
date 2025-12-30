// Price calculation helper functions

import { APP_CONSTANTS } from '../constants';

/**
 * Calculate VAT amount for a given price
 */
export function calculateVAT(amount: number): number {
    return Math.round(amount * APP_CONSTANTS.VAT_RATE * 100) / 100;
}

/**
 * Calculate order total including VAT, shipping, and discount
 */
export function calculateOrderTotal(
    subtotal: number,
    shippingCost: number,
    discount: number = 0,
): { vat: number; total: number; discountedSubtotal: number } {
    const discountedSubtotal = Math.max(subtotal - discount, 0);
    const vat = calculateVAT(discountedSubtotal);
    const total = discountedSubtotal + vat + shippingCost;

    return {
        vat: Math.round(vat * 100) / 100,
        total: Math.round(total * 100) / 100,
        discountedSubtotal: Math.round(discountedSubtotal * 100) / 100,
    };
}

/**
 * Format price as Nigerian Naira
 */
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Calculate percentage discount
 */
export function calculatePercentageDiscount(
    amount: number,
    percentage: number,
): number {
    return Math.round((amount * percentage) / 100 * 100) / 100;
}

/**
 * Round price to 2 decimal places
 */
export function roundPrice(amount: number): number {
    return Math.round(amount * 100) / 100;
}
