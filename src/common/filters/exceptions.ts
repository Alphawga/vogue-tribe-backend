// Custom business exception classes

import { HttpException, HttpStatus } from '@nestjs/common';
import { MESSAGES } from '../constants';

/**
 * Base business exception with custom error code
 */
export class BusinessException extends HttpException {
    constructor(
        message: string,
        code: string,
        statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    ) {
        super(
            {
                success: false,
                error: {
                    code,
                    message,
                },
            },
            statusCode,
        );
    }
}

// ============ AUTH EXCEPTIONS ============

export class InvalidCredentialsException extends BusinessException {
    constructor() {
        super(
            MESSAGES.AUTH.INVALID_CREDENTIALS,
            'INVALID_CREDENTIALS',
            HttpStatus.UNAUTHORIZED,
        );
    }
}

export class EmailAlreadyExistsException extends BusinessException {
    constructor() {
        super(
            MESSAGES.AUTH.EMAIL_ALREADY_EXISTS,
            'EMAIL_ALREADY_EXISTS',
            HttpStatus.CONFLICT,
        );
    }
}

export class TokenExpiredException extends BusinessException {
    constructor() {
        super(MESSAGES.AUTH.TOKEN_EXPIRED, 'TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED);
    }
}

export class AccountSuspendedException extends BusinessException {
    constructor() {
        super(
            MESSAGES.AUTH.ACCOUNT_SUSPENDED,
            'ACCOUNT_SUSPENDED',
            HttpStatus.FORBIDDEN,
        );
    }
}

// ============ RESOURCE EXCEPTIONS ============

export class NotFoundException extends BusinessException {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found.`, 'NOT_FOUND', HttpStatus.NOT_FOUND);
    }
}

export class ProductNotFoundException extends BusinessException {
    constructor() {
        super(MESSAGES.PRODUCT.NOT_FOUND, 'PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
}

export class CategoryNotFoundException extends BusinessException {
    constructor() {
        super(
            MESSAGES.CATEGORY.NOT_FOUND,
            'CATEGORY_NOT_FOUND',
            HttpStatus.NOT_FOUND,
        );
    }
}

export class OrderNotFoundException extends BusinessException {
    constructor() {
        super(MESSAGES.ORDER.NOT_FOUND, 'ORDER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
}

export class UserNotFoundException extends BusinessException {
    constructor() {
        super(MESSAGES.USER.NOT_FOUND, 'USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
}

// ============ INVENTORY EXCEPTIONS ============

export class OutOfStockException extends BusinessException {
    constructor() {
        super(MESSAGES.PRODUCT.OUT_OF_STOCK, 'OUT_OF_STOCK', HttpStatus.BAD_REQUEST);
    }
}

export class InsufficientStockException extends BusinessException {
    constructor(available: number) {
        super(
            MESSAGES.PRODUCT.INSUFFICIENT_STOCK(available),
            'INSUFFICIENT_STOCK',
            HttpStatus.BAD_REQUEST,
        );
    }
}

// ============ CART EXCEPTIONS ============

export class EmptyCartException extends BusinessException {
    constructor() {
        super(MESSAGES.CART.EMPTY_CART, 'EMPTY_CART', HttpStatus.BAD_REQUEST);
    }
}

export class InvalidCouponException extends BusinessException {
    constructor(message: string = MESSAGES.CART.INVALID_COUPON) {
        super(message, 'INVALID_COUPON', HttpStatus.BAD_REQUEST);
    }
}

export class CouponMinNotMetException extends BusinessException {
    constructor(minAmount: string) {
        super(
            MESSAGES.CART.COUPON_MIN_NOT_MET(minAmount),
            'COUPON_MIN_NOT_MET',
            HttpStatus.BAD_REQUEST,
        );
    }
}

// ============ ORDER EXCEPTIONS ============

export class OrderCancelNotAllowedException extends BusinessException {
    constructor() {
        super(
            MESSAGES.ORDER.CANCEL_NOT_ALLOWED,
            'CANCEL_NOT_ALLOWED',
            HttpStatus.BAD_REQUEST,
        );
    }
}

// ============ PAYMENT EXCEPTIONS ============

export class PaymentFailedException extends BusinessException {
    constructor() {
        super(MESSAGES.PAYMENT.FAILED, 'PAYMENT_FAILED', HttpStatus.BAD_REQUEST);
    }
}

export class PaymentAlreadyPaidException extends BusinessException {
    constructor() {
        super(MESSAGES.PAYMENT.ALREADY_PAID, 'ALREADY_PAID', HttpStatus.BAD_REQUEST);
    }
}

// ============ REVIEW EXCEPTIONS ============

export class AlreadyReviewedException extends BusinessException {
    constructor() {
        super(
            MESSAGES.REVIEW.ALREADY_REVIEWED,
            'ALREADY_REVIEWED',
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class PurchaseRequiredException extends BusinessException {
    constructor() {
        super(
            MESSAGES.REVIEW.PURCHASE_REQUIRED,
            'PURCHASE_REQUIRED',
            HttpStatus.FORBIDDEN,
        );
    }
}

// ============ AUTHORIZATION EXCEPTIONS ============

export class UnauthorizedException extends BusinessException {
    constructor() {
        super(MESSAGES.GENERAL.UNAUTHORIZED, 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
}

export class ForbiddenException extends BusinessException {
    constructor() {
        super(MESSAGES.GENERAL.FORBIDDEN, 'FORBIDDEN', HttpStatus.FORBIDDEN);
    }
}

export class BadRequestException extends BusinessException {
    constructor(message: string = 'Bad request') {
        super(message, 'BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
}

