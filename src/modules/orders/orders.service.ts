// Orders Service

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import type {
    CreateOrderDto,
    UpdateOrderStatusDto,
    ListOrdersQueryDto,
} from './schemas';
import type { ApiResponse, PaginatedResult } from '../../common/types';
import { MESSAGES } from '../../common/constants';
import {
    NotFoundException,
    EmptyCartException,
    OrderNotFoundException,
    OrderCancelNotAllowedException,
    InsufficientStockException,
} from '../../common/filters';
import {
    successResponse,
    createdResponse,
    updatedResponse,
    createPaginatedResult,
    calculatePagination,
    generateOrderNumber,
    calculateOrderTotal,
} from '../../common/helpers';

// Order response types
export interface OrderItemResponse {
    id: string;
    quantity: number;
    unitPrice: unknown;
    totalPrice: unknown;
    productName: string;
    variantColor: string;
    variantSize: string;
}

export interface OrderResponse {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: unknown;
    discount: unknown;
    shippingCost: unknown;
    vat: unknown;
    total: unknown;
    shippingAddress: unknown;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    items?: OrderItemResponse[];
}

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create order from cart (checkout)
     */
    async checkout(
        userId: string,
        dto: CreateOrderDto,
    ): Promise<ApiResponse<OrderResponse>> {
        // Get user's cart with items
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: { select: { name: true, basePrice: true } },
                            },
                        },
                    },
                },
                coupon: true,
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new EmptyCartException();
        }

        // Verify shipping address exists and belongs to user
        const address = await this.prisma.address.findFirst({
            where: { id: dto.addressId, userId },
        });

        if (!address) {
            throw new NotFoundException('Shipping address');
        }

        // Verify stock and calculate totals
        let subtotal = 0;
        const orderItems: Array<{
            variantId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            productName: string;
            variantColor: string;
            variantSize: string;
        }> = [];

        for (const item of cart.items) {
            if (item.variant.stockQuantity < item.quantity) {
                throw new InsufficientStockException(item.variant.stockQuantity);
            }

            const unitPrice = Number(item.variant.product.basePrice) + Number(item.variant.priceModifier);
            const totalPrice = unitPrice * item.quantity;
            subtotal += totalPrice;

            orderItems.push({
                variantId: item.variant.id,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
                productName: item.variant.product.name,
                variantColor: item.variant.color,
                variantSize: item.variant.size,
            });
        }

        // Calculate discount from coupon
        let discount = 0;
        if (cart.coupon) {
            const couponValue = Number(cart.coupon.value);
            if (cart.coupon.type === 'PERCENTAGE') {
                discount = (subtotal * couponValue) / 100;
            } else if (cart.coupon.type === 'FIXED_AMOUNT') {
                discount = couponValue;
            }
        }

        // Calculate shipping (flat rate for now - can be integrated with GIG later)
        const shippingCost = 2500; // ₦2,500 flat rate

        // Calculate VAT and total
        const { vat, total, discountedSubtotal } = calculateOrderTotal(subtotal, shippingCost, discount);

        // Create order in transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    userId,
                    status: 'PENDING',
                    subtotal: discountedSubtotal,
                    discount,
                    shippingCost,
                    vat,
                    total,
                    shippingAddress: {
                        firstName: address.firstName,
                        lastName: address.lastName,
                        phone: address.phone,
                        street: address.street,
                        city: address.city,
                        state: address.state,
                        postalCode: address.postalCode,
                        country: address.country,
                    },
                    notes: dto.notes,
                    couponId: cart.couponId,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    items: true,
                },
            });

            // Decrement stock for each variant
            for (const item of orderItems) {
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        stockQuantity: { decrement: item.quantity },
                    },
                });
            }

            // Increment coupon usage if applicable
            if (cart.couponId) {
                await tx.coupon.update({
                    where: { id: cart.couponId },
                    data: { usedCount: { increment: 1 } },
                });
            }

            // Clear cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            await tx.cart.update({
                where: { id: cart.id },
                data: { couponId: null },
            });

            return newOrder;
        });

        this.logger.log(`Order created: ${order.orderNumber} for user ${userId}`);

        return createdResponse(order, MESSAGES.ORDER.CREATED);
    }

    /**
     * Get user's orders
     */
    async getUserOrders(
        userId: string,
        query: ListOrdersQueryDto,
    ): Promise<ApiResponse<PaginatedResult<OrderResponse>>> {
        const { page, limit, status, fromDate, toDate } = query;
        const { skip, take } = calculatePagination(page, limit);

        const where: Record<string, unknown> = { userId };
        if (status) where.status = status;
        if (fromDate) where.createdAt = { ...((where.createdAt as object) || {}), gte: fromDate };
        if (toDate) where.createdAt = { ...((where.createdAt as object) || {}), lte: toDate };

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        const result = createPaginatedResult(orders, total, page, limit);
        return successResponse(result);
    }

    /**
     * Get single order by ID
     */
    async getOrderById(
        userId: string,
        orderId: string,
    ): Promise<ApiResponse<OrderResponse>> {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: true,
                payments: true,
                shipment: true,
            },
        });

        if (!order) {
            throw new OrderNotFoundException();
        }

        return successResponse(order);
    }

    /**
     * Cancel order (user-initiated)
     */
    async cancelOrder(userId: string, orderId: string): Promise<ApiResponse<OrderResponse>> {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { items: true },
        });

        if (!order) {
            throw new OrderNotFoundException();
        }

        // Only pending or confirmed orders can be cancelled
        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            throw new OrderCancelNotAllowedException();
        }

        // Cancel and restore stock
        const cancelled = await this.prisma.$transaction(async (tx) => {
            // Restore stock
            for (const item of order.items) {
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        stockQuantity: { increment: item.quantity },
                    },
                });
            }

            // Update order status
            return tx.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' },
                include: { items: true },
            });
        });

        this.logger.log(`Order cancelled: ${order.orderNumber} by user ${userId}`);

        return updatedResponse(cancelled, MESSAGES.ORDER.CANCELLED);
    }

    // ============ ADMIN OPERATIONS ============

    /**
     * List all orders (admin)
     */
    async findAll(
        query: ListOrdersQueryDto,
    ): Promise<ApiResponse<PaginatedResult<OrderResponse>>> {
        const { page, limit, status, fromDate, toDate } = query;
        const { skip, take } = calculatePagination(page, limit);

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (fromDate) where.createdAt = { ...((where.createdAt as object) || {}), gte: fromDate };
        if (toDate) where.createdAt = { ...((where.createdAt as object) || {}), lte: toDate };

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take,
                include: {
                    user: { select: { email: true, firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        const result = createPaginatedResult(orders, total, page, limit);
        return successResponse(result);
    }

    /**
     * Get order by ID (admin)
     */
    async findById(orderId: string): Promise<ApiResponse<OrderResponse>> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { email: true, firstName: true, lastName: true, phone: true } },
                items: true,
                payments: true,
                shipment: true,
            },
        });

        if (!order) {
            throw new OrderNotFoundException();
        }

        return successResponse(order);
    }

    /**
     * Update order status (admin)
     */
    async updateStatus(
        orderId: string,
        dto: UpdateOrderStatusDto,
    ): Promise<ApiResponse<OrderResponse>> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new OrderNotFoundException();
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: dto.status },
            include: { items: true },
        });

        this.logger.log(`Order ${order.orderNumber} status updated to ${dto.status}`);

        return updatedResponse(updated, MESSAGES.ORDER.STATUS_UPDATED(dto.status));
    }
}
