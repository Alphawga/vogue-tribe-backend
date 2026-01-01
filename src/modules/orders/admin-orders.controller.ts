// Admin Orders Controller

import {
    Controller,
    Get,
    Put,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { updateOrderStatusSchema, listOrdersQuerySchema } from './schemas';
import type { UpdateOrderStatusDto, ListOrdersQueryDto } from './schemas';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import { uuidSchema } from '../../common/schemas';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminOrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /**
     * List all orders
     * GET /api/v1/admin/orders
     */
    @Get()
    async findAll(
        @Query(new ZodValidationPipe(listOrdersQuerySchema)) query: ListOrdersQueryDto,
    ) {
        return this.ordersService.findAll(query);
    }

    /**
     * Get order by ID
     * GET /api/v1/admin/orders/:id
     */
    @Get(':id')
    async findById(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.ordersService.findById(id);
    }

    /**
     * Update order status
     * PUT /api/v1/admin/orders/:id/status
     */
    @Put(':id/status')
    async updateStatus(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
        @Body(new ZodValidationPipe(updateOrderStatusSchema)) dto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateStatus(id, dto);
    }
}
