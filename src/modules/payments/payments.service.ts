// Payments Service - OPay Integration

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma';
import type {
    InitializePaymentDto,
    OPayWebhookDto,
    ListPaymentsQueryDto,
} from './schemas';
import type { ApiResponse, PaginatedResult } from '../../common/types';
import { MESSAGES } from '../../common/constants';
import {
    OrderNotFoundException,
    PaymentFailedException,
    PaymentAlreadyPaidException,
} from '../../common/filters';
import {
    successResponse,
    createdResponse,
    updatedResponse,
    createPaginatedResult,
    calculatePagination,
    generatePaymentReference,
} from '../../common/helpers';

// Payment response types
export interface PaymentResponse {
    id: string;
    orderId: string;
    reference: string;
    provider: string;
    amount: unknown;
    status: string;
    providerRef: string | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentInitResponse {
    payment: PaymentResponse;
    paymentUrl: string;
    reference: string;
}

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly opayBaseUrl: string;
    private readonly opayMerchantId: string;
    private readonly opaySecretKey: string;
    private readonly callbackUrl: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.opayBaseUrl = this.configService.get<string>('opay.baseUrl') || 'https://cashierapi.opayweb.com/api/v3';
        this.opayMerchantId = this.configService.get<string>('opay.merchantId') || '';
        this.opaySecretKey = this.configService.get<string>('opay.secretKey') || '';
        this.callbackUrl = this.configService.get<string>('opay.callbackUrl') || '';
    }

    /**
     * Initialize payment for an order
     */
    async initializePayment(
        userId: string,
        dto: InitializePaymentDto,
    ): Promise<ApiResponse<PaymentInitResponse>> {
        // Verify order exists and belongs to user
        const order = await this.prisma.order.findFirst({
            where: { id: dto.orderId, userId },
            include: { payments: true },
        });

        if (!order) {
            throw new OrderNotFoundException();
        }

        // Check if order is already paid
        const successPayment = order.payments.find((p) => p.status === 'SUCCESS');
        if (successPayment) {
            throw new PaymentAlreadyPaidException();
        }

        // Check for pending payment
        const pendingPayment = order.payments.find((p) => p.status === 'PENDING');
        if (pendingPayment) {
            // Return existing pending payment
            return successResponse({
                payment: pendingPayment,
                paymentUrl: this.generatePaymentUrl(pendingPayment.reference, Number(order.total)),
                reference: pendingPayment.reference,
            });
        }

        // Create new payment record
        const reference = generatePaymentReference();
        const payment = await this.prisma.payment.create({
            data: {
                orderId: order.id,
                reference,
                provider: 'OPAY',
                amount: order.total,
                status: 'PENDING',
            },
        });

        // Generate payment URL (in production, this would call OPay API)
        const paymentUrl = this.generatePaymentUrl(reference, Number(order.total));

        this.logger.log(`Payment initialized for order ${order.orderNumber}: ${reference}`);

        return createdResponse(
            {
                payment,
                paymentUrl,
                reference,
            },
            MESSAGES.PAYMENT.INITIATED,
        );
    }

    /**
     * Generate OPay payment URL
     * In production, this would create a checkout session via OPay API
     */
    private generatePaymentUrl(reference: string, amount: number): string {
        // This is a simplified version - in production you'd call OPay API
        // to create a checkout session and return the actual payment URL
        const baseUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
        return `${baseUrl}/payment?ref=${reference}&amount=${amount}`;
    }

    /**
     * Handle OPay webhook callback
     */
    async handleWebhook(dto: OPayWebhookDto): Promise<ApiResponse<PaymentResponse>> {
        const payment = await this.prisma.payment.findUnique({
            where: { reference: dto.reference },
            include: { order: true },
        });

        if (!payment) {
            throw new PaymentFailedException();
        }

        // Verify amount matches
        if (Number(payment.amount) !== dto.amount) {
            this.logger.error(`Payment amount mismatch for ${dto.reference}`);
            throw new PaymentFailedException();
        }

        // Update payment status
        const updatedPayment = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: dto.status,
                    providerRef: dto.reference,
                    paidAt: dto.status === 'SUCCESS' ? new Date() : null,
                    metadata: JSON.parse(JSON.stringify(dto)),
                },
            });

            // Update order status if payment successful
            if (dto.status === 'SUCCESS') {
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: { status: 'CONFIRMED' },
                });
            }

            return updated;
        });

        this.logger.log(`Payment ${dto.reference} status updated to ${dto.status}`);

        return updatedResponse(
            updatedPayment,
            dto.status === 'SUCCESS' ? MESSAGES.PAYMENT.SUCCESS : MESSAGES.PAYMENT.FAILED,
        );
    }

    /**
     * Get payment by reference
     */
    async getPaymentByReference(reference: string): Promise<ApiResponse<PaymentResponse>> {
        const payment = await this.prisma.payment.findUnique({
            where: { reference },
            include: { order: { select: { orderNumber: true, userId: true } } },
        });

        if (!payment) {
            throw new PaymentFailedException();
        }

        return successResponse(payment);
    }

    /**
     * Get payment by order ID
     */
    async getPaymentByOrderId(
        userId: string,
        orderId: string,
    ): Promise<ApiResponse<PaymentResponse | null>> {
        const payment = await this.prisma.payment.findFirst({
            where: {
                orderId,
                order: { userId },
            },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse(payment);
    }

    // ============ ADMIN OPERATIONS ============

    /**
     * List all payments (admin)
     */
    async findAll(
        query: ListPaymentsQueryDto,
    ): Promise<ApiResponse<PaginatedResult<PaymentResponse>>> {
        const { page, limit, status, orderId } = query;
        const { skip, take } = calculatePagination(page, limit);

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (orderId) where.orderId = orderId;

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take,
                include: {
                    order: {
                        select: { orderNumber: true, user: { select: { email: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payment.count({ where }),
        ]);

        const result = createPaginatedResult(payments, total, page, limit);
        return successResponse(result);
    }

    /**
     * Get payment by ID (admin)
     */
    async findById(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        total: true,
                        user: { select: { email: true, firstName: true, lastName: true } },
                    },
                },
            },
        });

        if (!payment) {
            throw new PaymentFailedException();
        }

        return successResponse(payment);
    }

    /**
     * Initiate refund (admin)
     */
    async initiateRefund(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment || payment.status !== 'SUCCESS') {
            throw new PaymentFailedException();
        }

        // In production, this would call OPay refund API
        const updated = await this.prisma.$transaction(async (tx) => {
            const refunded = await tx.payment.update({
                where: { id: paymentId },
                data: { status: 'REFUNDED' },
            });

            // Update order status
            await tx.order.update({
                where: { id: payment.orderId },
                data: { status: 'REFUNDED' },
            });

            return refunded;
        });

        this.logger.log(`Payment ${payment.reference} refunded`);

        return updatedResponse(updated, MESSAGES.PAYMENT.REFUND_SUCCESS);
    }
}
