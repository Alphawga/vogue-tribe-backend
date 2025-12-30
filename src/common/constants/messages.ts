// User-friendly response messages for all modules

export const MESSAGES = {
    // Authentication
    AUTH: {
        LOGIN_SUCCESS: 'Welcome back! You have successfully logged in.',
        REGISTER_SUCCESS:
            'Account created successfully! Please check your email to verify your account.',
        LOGOUT_SUCCESS: 'You have been logged out successfully.',
        PASSWORD_RESET_SENT:
            'Password reset instructions have been sent to your email.',
        PASSWORD_CHANGED: 'Your password has been updated successfully.',
        INVALID_CREDENTIALS:
            'The email or password you entered is incorrect. Please try again.',
        EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',
        ACCOUNT_SUSPENDED:
            'Your account has been suspended. Please contact support for assistance.',
        EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
        TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
        INVALID_TOKEN: 'Invalid or expired token. Please try again.',
        GOOGLE_AUTH_FAILED:
            'Google authentication failed. Please try again or use email login.',
    },

    // Users
    USER: {
        PROFILE_UPDATED: 'Your profile has been updated successfully.',
        ADDRESS_ADDED: 'Address has been added successfully.',
        ADDRESS_UPDATED: 'Address has been updated.',
        ADDRESS_DELETED: 'Address has been removed.',
        NOT_FOUND: 'User not found.',
        STATUS_UPDATED: (status: string) => `User status updated to ${status}.`,
    },

    // Products
    PRODUCT: {
        CREATED: 'Product has been created successfully.',
        UPDATED: 'Product details have been updated.',
        DELETED: 'Product has been removed from the catalog.',
        NOT_FOUND:
            'The product you are looking for does not exist or has been removed.',
        OUT_OF_STOCK: 'Sorry, this item is currently out of stock.',
        INSUFFICIENT_STOCK: (available: number) =>
            `Only ${available} item(s) available. Please reduce your quantity.`,
        IMAGE_UPLOADED: 'Product image has been uploaded.',
        IMAGE_DELETED: 'Product image has been removed.',
        VARIANT_ADDED: 'Product variant has been added.',
        VARIANT_UPDATED: 'Product variant has been updated.',
        VARIANT_DELETED: 'Product variant has been removed.',
    },

    // Categories
    CATEGORY: {
        CREATED: 'Category has been created successfully.',
        UPDATED: 'Category has been updated.',
        DELETED: 'Category has been removed.',
        NOT_FOUND: 'Category not found.',
        HAS_PRODUCTS:
            'Cannot delete category with existing products. Please move or delete products first.',
    },

    // Cart
    CART: {
        ITEM_ADDED: 'Item has been added to your cart.',
        ITEM_UPDATED: 'Cart has been updated.',
        ITEM_REMOVED: 'Item has been removed from your cart.',
        CART_CLEARED: 'Your cart is now empty.',
        COUPON_APPLIED: (discount: string) => `Coupon applied! You saved ${discount}.`,
        COUPON_REMOVED: 'Coupon has been removed.',
        INVALID_COUPON: 'This coupon code is invalid or has expired.',
        COUPON_ALREADY_USED: 'You have already used this coupon.',
        COUPON_MIN_NOT_MET: (min: string) =>
            `This coupon requires a minimum order of ${min}.`,
        COUPON_MAX_USES_REACHED: 'This coupon has reached its maximum usage limit.',
        EMPTY_CART: 'Your cart is empty. Please add items before checkout.',
    },

    // Orders
    ORDER: {
        CREATED: 'Your order has been placed successfully!',
        UPDATED: 'Order has been updated.',
        CANCELLED:
            'Your order has been cancelled. Refund will be processed within 3-5 business days.',
        CANCEL_NOT_ALLOWED:
            'This order cannot be cancelled as it has already been shipped.',
        NOT_FOUND: 'Order not found. Please check your order number.',
        STATUS_UPDATED: (status: string) => `Order status updated to ${status}.`,
        SHIPPED: 'Order has been shipped. Tracking information has been sent.',
        DELIVERED: 'Order has been marked as delivered.',
    },

    // Payments
    PAYMENT: {
        INITIATED: 'Payment initiated. Please complete the transaction.',
        SUCCESS: 'Payment received successfully! Your order is being processed.',
        FAILED:
            'Payment could not be completed. Please try again or use a different payment method.',
        REFUND_INITIATED:
            'Refund has been initiated. It will reflect in your account within 5-7 business days.',
        REFUND_SUCCESS: 'Refund has been processed successfully.',
        ALREADY_PAID: 'This order has already been paid.',
        NOT_FOUND: 'Payment record not found.',
    },

    // Shipping
    SHIPPING: {
        BOOKED: 'Shipment has been booked successfully.',
        TRACKING_UPDATED: 'Tracking information has been updated.',
        CANCELLED: 'Shipment has been cancelled.',
        RATE_CALCULATED: 'Shipping rate calculated successfully.',
        ADDRESS_NOT_SERVICEABLE:
            'Sorry, we currently do not deliver to this location.',
    },

    // Wishlist
    WISHLIST: {
        ADDED: 'Item added to your wishlist.',
        REMOVED: 'Item removed from your wishlist.',
        ALREADY_EXISTS: 'This item is already in your wishlist.',
        MOVED_TO_CART: 'Item has been moved to your cart.',
        NOT_FOUND: 'Item not found in your wishlist.',
    },

    // Reviews
    REVIEW: {
        CREATED: 'Thank you for your review!',
        UPDATED: 'Your review has been updated.',
        DELETED: 'Your review has been removed.',
        APPROVED: 'Review has been approved.',
        REJECTED: 'Review has been rejected.',
        ALREADY_REVIEWED: 'You have already reviewed this product.',
        PURCHASE_REQUIRED: 'You can only review products you have purchased.',
        NOT_FOUND: 'Review not found.',
    },

    // Coupons
    COUPON: {
        CREATED: 'Coupon has been created successfully.',
        UPDATED: 'Coupon has been updated.',
        DELETED: 'Coupon has been removed.',
        NOT_FOUND: 'Coupon not found.',
        EXPIRED: 'This coupon has expired.',
        NOT_ACTIVE: 'This coupon is not currently active.',
    },

    // CMS
    CMS: {
        BANNER_CREATED: 'Banner has been created successfully.',
        BANNER_UPDATED: 'Banner has been updated.',
        BANNER_DELETED: 'Banner has been removed.',
        PAGE_CREATED: 'Page has been created successfully.',
        PAGE_UPDATED: 'Page has been updated.',
        PAGE_NOT_FOUND: 'Page not found.',
        COLLECTION_CREATED: 'Collection has been created successfully.',
        COLLECTION_UPDATED: 'Collection has been updated.',
        PRODUCTS_ADDED_TO_COLLECTION: 'Products added to collection successfully.',
    },

    // Newsletter
    NEWSLETTER: {
        SUBSCRIBED: 'Thank you for subscribing to our newsletter!',
        ALREADY_SUBSCRIBED: 'You are already subscribed to our newsletter.',
        UNSUBSCRIBED: 'You have been unsubscribed from our newsletter.',
        CAMPAIGN_CREATED: 'Campaign has been created successfully.',
        CAMPAIGN_SENT: 'Campaign has been sent successfully.',
    },

    // General
    GENERAL: {
        NOT_FOUND: 'The requested resource was not found.',
        UNAUTHORIZED: 'Please log in to continue.',
        FORBIDDEN: 'You do not have permission to perform this action.',
        SERVER_ERROR: 'Something went wrong. Please try again later.',
        RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',
        VALIDATION_FAILED: 'Validation failed. Please check your input.',
        SUCCESS: 'Operation completed successfully.',
        CREATED: 'Resource created successfully.',
        UPDATED: 'Resource updated successfully.',
        DELETED: 'Resource deleted successfully.',
    },
} as const;

export type MessageKey = keyof typeof MESSAGES;
