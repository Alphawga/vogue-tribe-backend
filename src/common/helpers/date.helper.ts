// Date helper functions

/**
 * Format date for Nigerian locale
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

/**
 * Format date only (no time)
 */
export function formatDateOnly(date: Date): string {
    return new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'long',
    }).format(date);
}

/**
 * Check if a date has expired
 */
export function isExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
}

/**
 * Get the start of today
 */
export function startOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * Get the end of today
 */
export function endOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}
