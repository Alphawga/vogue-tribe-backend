// Admin Users Controller

import {
    Controller,
    Get,
    Put,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
    listUsersQuerySchema,
    updateUserStatusSchema,
} from './schemas';
import type {
    ListUsersQueryDto,
    UpdateUserStatusDto,
} from './schemas';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { ZodValidationPipe } from '../../common/pipes';
import { Roles } from '../../common/decorators';
import { uuidSchema } from '../../common/schemas';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminUsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * List all users
     * GET /api/v1/admin/users
     */
    @Get()
    async listUsers(
        @Query(new ZodValidationPipe(listUsersQuerySchema)) query: ListUsersQueryDto,
    ) {
        return this.usersService.listUsers(query);
    }

    /**
     * Get user by ID
     * GET /api/v1/admin/users/:id
     */
    @Get(':id')
    async getUserById(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.usersService.getUserById(id);
    }

    /**
     * Update user status
     * PUT /api/v1/admin/users/:id/status
     */
    @Put(':id/status')
    async updateUserStatus(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
        @Body(new ZodValidationPipe(updateUserStatusSchema)) dto: UpdateUserStatusDto,
    ) {
        return this.usersService.updateUserStatus(id, dto);
    }
}
