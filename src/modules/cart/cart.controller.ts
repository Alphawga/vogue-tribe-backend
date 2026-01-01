// Cart Controller

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
    addCartItemSchema,
    updateCartItemSchema,
    applyCouponSchema,
} from './schemas';
import type {
    AddCartItemDto,
    UpdateCartItemDto,
    ApplyCouponDto,
} from './schemas';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import { uuidSchema } from '../../common/schemas';

interface AuthUser {
    id: string;
    email: string;
    role: string;
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    /**
     * Get current user's cart
     * GET /api/v1/cart
     */
    @Get()
    async getCart(@CurrentUser() user: AuthUser) {
        return this.cartService.getCart(user.id);
    }

    /**
     * Add item to cart
     * POST /api/v1/cart/items
     */
    @Post('items')
    async addItem(
        @CurrentUser() user: AuthUser,
        @Body(new ZodValidationPipe(addCartItemSchema)) dto: AddCartItemDto,
    ) {
        return this.cartService.addItem(user.id, dto);
    }

    /**
     * Update cart item quantity
     * PUT /api/v1/cart/items/:itemId
     */
    @Put('items/:itemId')
    async updateItem(
        @CurrentUser() user: AuthUser,
        @Param('itemId', new ZodValidationPipe(uuidSchema)) itemId: string,
        @Body(new ZodValidationPipe(updateCartItemSchema)) dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(user.id, itemId, dto);
    }

    /**
     * Remove item from cart
     * DELETE /api/v1/cart/items/:itemId
     */
    @Delete('items/:itemId')
    async removeItem(
        @CurrentUser() user: AuthUser,
        @Param('itemId', new ZodValidationPipe(uuidSchema)) itemId: string,
    ) {
        return this.cartService.removeItem(user.id, itemId);
    }

    /**
     * Clear all items from cart
     * DELETE /api/v1/cart
     */
    @Delete()
    async clearCart(@CurrentUser() user: AuthUser) {
        return this.cartService.clearCart(user.id);
    }

    /**
     * Apply coupon to cart
     * POST /api/v1/cart/coupon
     */
    @Post('coupon')
    async applyCoupon(
        @CurrentUser() user: AuthUser,
        @Body(new ZodValidationPipe(applyCouponSchema)) dto: ApplyCouponDto,
    ) {
        return this.cartService.applyCoupon(user.id, dto);
    }

    /**
     * Remove coupon from cart
     * DELETE /api/v1/cart/coupon
     */
    @Delete('coupon')
    async removeCoupon(@CurrentUser() user: AuthUser) {
        return this.cartService.removeCoupon(user.id);
    }
}
