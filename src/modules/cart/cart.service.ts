// Cart Service

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import type {
    AddCartItemDto,
    UpdateCartItemDto,
    ApplyCouponDto,
} from './schemas';
import type { ApiResponse } from '../../common/types';
import { MESSAGES } from '../../common/constants';
import {
    NotFoundException,
    OutOfStockException,
    InsufficientStockException,
    InvalidCouponException,
    CouponMinNotMetException,
    EmptyCartException,
} from '../../common/filters';
import {
    successResponse,
    updatedResponse,
    deletedResponse,
    formatNaira,
} from '../../common/helpers';

// Cart response types
export interface CartItemResponse {
    id: string;
    quantity: number;
    variant: {
        id: string;
        sku: string;
        color: string;
        size: string;
        stockQuantity: number;
        priceModifier: unknown;
        product: {
            id: string;
            name: string;
            slug: string;
            basePrice: unknown;
            images: Array<{ url: string }>;
        };
    };
}

export interface CartResponse {
    id: string;
    items: CartItemResponse[];
    itemCount: number;
    subtotal: number;
    discount: number;
    total: number;
    coupon: {
        code: string;
        type: string;
        value: unknown;
    } | null;
}

@Injectable()
export class CartService {
    private readonly logger = new Logger(CartService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get or create cart for user
     */
    private async getOrCreateCart(userId: string): Promise<string> {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: {
                    userId,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                },
            });
        }

        return cart.id;
    }

    /**
     * Calculate cart totals
     */
    private calculateTotals(
        items: CartItemResponse[],
        coupon: { type: string; value: unknown; minOrderAmount: unknown | null } | null,
    ): { subtotal: number; discount: number; total: number } {
        const subtotal = items.reduce((sum, item) => {
            const basePrice = Number(item.variant.product.basePrice);
            const priceModifier = Number(item.variant.priceModifier);
            return sum + (basePrice + priceModifier) * item.quantity;
        }, 0);

        let discount = 0;
        if (coupon) {
            const couponValue = Number(coupon.value);
            if (coupon.type === 'PERCENTAGE') {
                discount = (subtotal * couponValue) / 100;
            } else if (coupon.type === 'FIXED_AMOUNT') {
                discount = couponValue;
            }
        }

        const total = Math.max(0, subtotal - discount);

        return { subtotal, discount, total };
    }

    /**
     * Get user's cart
     */
    async getCart(userId: string): Promise<ApiResponse<CartResponse>> {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                        basePrice: true,
                                        images: {
                                            where: { isPrimary: true },
                                            select: { url: true },
                                            take: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                coupon: true,
            },
        });

        if (!cart) {
            return successResponse({
                id: '',
                items: [],
                itemCount: 0,
                subtotal: 0,
                discount: 0,
                total: 0,
                coupon: null,
            });
        }

        const { subtotal, discount, total } = this.calculateTotals(
            cart.items as unknown as CartItemResponse[],
            cart.coupon,
        );

        return successResponse({
            id: cart.id,
            items: cart.items,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal,
            discount,
            total,
            coupon: cart.coupon
                ? { code: cart.coupon.code, type: cart.coupon.type, value: cart.coupon.value }
                : null,
        });
    }

    /**
     * Add item to cart
     */
    async addItem(
        userId: string,
        dto: AddCartItemDto,
    ): Promise<ApiResponse<CartResponse>> {
        // Verify variant exists and has stock
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: dto.variantId },
            include: { product: { select: { name: true } } },
        });

        if (!variant) {
            throw new NotFoundException('Product variant');
        }

        if (!variant.isActive) {
            throw new NotFoundException('Product variant');
        }

        if (variant.stockQuantity <= 0) {
            throw new OutOfStockException();
        }

        if (variant.stockQuantity < dto.quantity) {
            throw new InsufficientStockException(variant.stockQuantity);
        }

        const cartId = await this.getOrCreateCart(userId);

        // Check if item already exists in cart
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_variantId: { cartId, variantId: dto.variantId },
            },
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + dto.quantity;
            if (newQuantity > variant.stockQuantity) {
                throw new InsufficientStockException(variant.stockQuantity);
            }

            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            await this.prisma.cartItem.create({
                data: {
                    cartId,
                    variantId: dto.variantId,
                    quantity: dto.quantity,
                },
            });
        }

        this.logger.log(`Item added to cart for user ${userId}`);

        const result = await this.getCart(userId);
        return {
            ...result,
            message: MESSAGES.CART.ITEM_ADDED,
        };
    }

    /**
     * Update cart item quantity
     */
    async updateItem(
        userId: string,
        itemId: string,
        dto: UpdateCartItemDto,
    ): Promise<ApiResponse<CartResponse>> {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            throw new EmptyCartException();
        }

        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
            include: { variant: true },
        });

        if (!item) {
            throw new NotFoundException('Cart item');
        }

        if (dto.quantity > item.variant.stockQuantity) {
            throw new InsufficientStockException(item.variant.stockQuantity);
        }

        await this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: dto.quantity },
        });

        this.logger.log(`Cart item updated for user ${userId}`);

        const result = await this.getCart(userId);
        return {
            ...result,
            message: MESSAGES.CART.ITEM_UPDATED,
        };
    }

    /**
     * Remove item from cart
     */
    async removeItem(
        userId: string,
        itemId: string,
    ): Promise<ApiResponse<CartResponse>> {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            throw new EmptyCartException();
        }

        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });

        if (!item) {
            throw new NotFoundException('Cart item');
        }

        await this.prisma.cartItem.delete({
            where: { id: itemId },
        });

        this.logger.log(`Cart item removed for user ${userId}`);

        const result = await this.getCart(userId);
        return {
            ...result,
            message: MESSAGES.CART.ITEM_REMOVED,
        };
    }

    /**
     * Clear all items from cart
     */
    async clearCart(userId: string): Promise<ApiResponse<null>> {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            // Also remove coupon
            await this.prisma.cart.update({
                where: { id: cart.id },
                data: { couponId: null },
            });
        }

        this.logger.log(`Cart cleared for user ${userId}`);

        return deletedResponse(MESSAGES.CART.CART_CLEARED);
    }

    /**
     * Apply coupon to cart
     */
    async applyCoupon(
        userId: string,
        dto: ApplyCouponDto,
    ): Promise<ApiResponse<CartResponse>> {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: { select: { basePrice: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new EmptyCartException();
        }

        // Find coupon
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: dto.code },
        });

        if (!coupon) {
            throw new InvalidCouponException();
        }

        // Validate coupon
        const now = new Date();
        if (!coupon.isActive) {
            throw new InvalidCouponException(MESSAGES.COUPON.NOT_ACTIVE);
        }
        if (coupon.startsAt > now || coupon.expiresAt < now) {
            throw new InvalidCouponException(MESSAGES.COUPON.EXPIRED);
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new InvalidCouponException(MESSAGES.CART.COUPON_MAX_USES_REACHED);
        }

        // Calculate subtotal to check minimum
        const subtotal = cart.items.reduce((sum, item) => {
            const basePrice = Number(item.variant.product.basePrice);
            const priceModifier = Number(item.variant.priceModifier);
            return sum + (basePrice + priceModifier) * item.quantity;
        }, 0);

        if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
            throw new CouponMinNotMetException(formatNaira(Number(coupon.minOrderAmount)));
        }

        // Apply coupon to cart
        await this.prisma.cart.update({
            where: { id: cart.id },
            data: { couponId: coupon.id },
        });

        this.logger.log(`Coupon ${dto.code} applied to cart for user ${userId}`);

        const result = await this.getCart(userId);
        const discountText = formatNaira(result.data?.discount || 0);
        return {
            ...result,
            message: MESSAGES.CART.COUPON_APPLIED(discountText),
        };
    }

    /**
     * Remove coupon from cart
     */
    async removeCoupon(userId: string): Promise<ApiResponse<CartResponse>> {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            throw new EmptyCartException();
        }

        await this.prisma.cart.update({
            where: { id: cart.id },
            data: { couponId: null },
        });

        this.logger.log(`Coupon removed from cart for user ${userId}`);

        const result = await this.getCart(userId);
        return {
            ...result,
            message: MESSAGES.CART.COUPON_REMOVED,
        };
    }
}
