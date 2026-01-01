// Payments Controller - User endpoints

import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { initializePaymentSchema } from './schemas';
import type { InitializePaymentDto } from './schemas';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser, Public } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import { uuidSchema } from '../../common/schemas';

interface AuthUser {
    id: string;
    email: string;
    role: string;
}

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * Initialize payment for an order
     * POST /api/v1/payments/initialize
     */
    @Post('initialize')
    @UseGuards(JwtAuthGuard)
    async initializePayment(
        @CurrentUser() user: AuthUser,
        @Body(new ZodValidationPipe(initializePaymentSchema)) dto: InitializePaymentDto,
    ) {
        return this.paymentsService.initializePayment(user.id, dto);
    }

    /**
     * Get payment by order ID
     * GET /api/v1/payments/order/:orderId
     */
    @Get('order/:orderId')
    @UseGuards(JwtAuthGuard)
    async getPaymentByOrderId(
        @CurrentUser() user: AuthUser,
        @Param('orderId', new ZodValidationPipe(uuidSchema)) orderId: string,
    ) {
        return this.paymentsService.getPaymentByOrderId(user.id, orderId);
    }

    /**
     * Verify payment by reference
     * GET /api/v1/payments/verify/:reference
     */
    @Get('verify/:reference')
    @Public()
    async verifyPayment(@Param('reference') reference: string) {
        return this.paymentsService.getPaymentByReference(reference);
    }
}
