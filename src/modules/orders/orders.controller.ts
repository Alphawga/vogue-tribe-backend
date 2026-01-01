// Orders Controller - User endpoints

import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { createOrderSchema, listOrdersQuerySchema } from './schemas';
import type { CreateOrderDto, ListOrdersQueryDto } from './schemas';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import { uuidSchema } from '../../common/schemas';

interface AuthUser {
    id: string;
    email: string;
    role: string;
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /**
     * Checkout - create order from cart
     * POST /api/v1/orders
     */
    @Post()
    async checkout(
        @CurrentUser() user: AuthUser,
        @Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDto,
    ) {
        return this.ordersService.checkout(user.id, dto);
    }

    /**
     * Get current user's orders
     * GET /api/v1/orders
     */
    @Get()
    async getUserOrders(
        @CurrentUser() user: AuthUser,
        @Query(new ZodValidationPipe(listOrdersQuerySchema)) query: ListOrdersQueryDto,
    ) {
        return this.ordersService.getUserOrders(user.id, query);
    }

    /**
     * Get order by ID
     * GET /api/v1/orders/:id
     */
    @Get(':id')
    async getOrderById(
        @CurrentUser() user: AuthUser,
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.ordersService.getOrderById(user.id, id);
    }

    /**
     * Cancel order
     * PUT /api/v1/orders/:id/cancel
     */
    @Put(':id/cancel')
    async cancelOrder(
        @CurrentUser() user: AuthUser,
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.ordersService.cancelOrder(user.id, id);
    }
}
