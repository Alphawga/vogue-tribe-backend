// Application-wide constants

export const APP_CONSTANTS = {
    // Pagination
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,

    // VAT Rate (Nigeria)
    VAT_RATE: 0.075, // 7.5%

    // Cart
    CART_RESERVATION_MINUTES: 15,
    MAX_CART_ITEMS: 50,
    MAX_ITEM_QUANTITY: 10,

    // Inventory
    DEFAULT_LOW_STOCK_THRESHOLD: 5,

    // JWT
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',

    // Rate Limiting
    AUTH_RATE_LIMIT: 20, // requests per minute for auth endpoints
    PUBLIC_RATE_LIMIT: 60, // requests per minute for public endpoints
    AUTHENTICATED_RATE_LIMIT: 100, // requests per minute for authenticated endpoints

    // File Upload
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

    // Order Number
    ORDER_PREFIX: 'VT',

    // Reviews
    MIN_RATING: 1,
    MAX_RATING: 5,
} as const;

export * from './messages';
