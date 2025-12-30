// Users Controller - Public endpoints

import {
    Controller,
    Get,
    Put,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
    updateProfileSchema,
    createAddressSchema,
    updateAddressSchema,
} from './schemas';
import type {
    UpdateProfileDto,
    CreateAddressDto,
    UpdateAddressDto,
} from './schemas';
import { JwtAuthGuard } from '../auth/guards';
import { ZodValidationPipe } from '../../common/pipes';
import { CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/types';
import { uuidSchema } from '../../common/schemas';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Get current user profile
     * GET /api/v1/users/profile
     */
    @Get('profile')
    async getProfile(@CurrentUser() user: RequestUser) {
        return this.usersService.getProfile(user.id);
    }

    /**
     * Update current user profile
     * PUT /api/v1/users/profile
     */
    @Put('profile')
    async updateProfile(
        @CurrentUser() user: RequestUser,
        @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(user.id, dto);
    }

    // ============ ADDRESSES ============

    /**
     * Get user addresses
     * GET /api/v1/users/addresses
     */
    @Get('addresses')
    async getAddresses(@CurrentUser() user: RequestUser) {
        return this.usersService.getAddresses(user.id);
    }

    /**
     * Create new address
     * POST /api/v1/users/addresses
     */
    @Post('addresses')
    async createAddress(
        @CurrentUser() user: RequestUser,
        @Body(new ZodValidationPipe(createAddressSchema)) dto: CreateAddressDto,
    ) {
        return this.usersService.createAddress(user.id, dto);
    }

    /**
     * Update address
     * PUT /api/v1/users/addresses/:id
     */
    @Put('addresses/:id')
    async updateAddress(
        @CurrentUser() user: RequestUser,
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
        @Body(new ZodValidationPipe(updateAddressSchema)) dto: UpdateAddressDto,
    ) {
        return this.usersService.updateAddress(user.id, id, dto);
    }

    /**
     * Delete address
     * DELETE /api/v1/users/addresses/:id
     */
    @Delete('addresses/:id')
    async deleteAddress(
        @CurrentUser() user: RequestUser,
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.usersService.deleteAddress(user.id, id);
    }

    /**
     * Set address as default
     * PUT /api/v1/users/addresses/:id/default
     */
    @Put('addresses/:id/default')
    async setDefaultAddress(
        @CurrentUser() user: RequestUser,
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.usersService.setDefaultAddress(user.id, id);
    }
}
