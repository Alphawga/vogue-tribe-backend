// Admin Payments Controller

import {
    Controller,
    Get,
    Put,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { listPaymentsQuerySchema } from './schemas';
import type { ListPaymentsQueryDto } from './schemas';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import { uuidSchema } from '../../common/schemas';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminPaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * List all payments
     * GET /api/v1/admin/payments
     */
    @Get()
    async findAll(
        @Query(new ZodValidationPipe(listPaymentsQuerySchema)) query: ListPaymentsQueryDto,
    ) {
        return this.paymentsService.findAll(query);
    }

    /**
     * Get payment by ID
     * GET /api/v1/admin/payments/:id
     */
    @Get(':id')
    async findById(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.paymentsService.findById(id);
    }

    /**
     * Initiate refund
     * PUT /api/v1/admin/payments/:id/refund
     */
    @Put(':id/refund')
    async initiateRefund(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.paymentsService.initiateRefund(id);
    }
}
