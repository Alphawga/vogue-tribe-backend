// Users Service

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import type {
    UpdateProfileDto,
    CreateAddressDto,
    UpdateAddressDto,
    UpdateUserStatusDto,
    ListUsersQueryDto,
} from './schemas';
import type { ApiResponse, PaginatedResult } from '../../common/types';
import { MESSAGES } from '../../common/constants';
import {
    UserNotFoundException,
    NotFoundException,
} from '../../common/filters';
import {
    successResponse,
    createdResponse,
    updatedResponse,
    deletedResponse,
    createPaginatedResult,
    calculatePagination,
} from '../../common/helpers';

// Exported response types
export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    createdAt: Date;
}

export interface AddressResponse {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string | null;
    country: string;
    isDefault: boolean;
}

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get user profile
     */
    async getProfile(userId: string): Promise<ApiResponse<UserProfile>> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return successResponse(user);
    }

    /**
     * Update user profile
     */
    async updateProfile(
        userId: string,
        dto: UpdateProfileDto,
    ): Promise<ApiResponse<UserProfile>> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: dto,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
            },
        });

        this.logger.log(`Profile updated for user: ${user.email}`);

        return updatedResponse(user, MESSAGES.USER.PROFILE_UPDATED);
    }

    // ============ ADDRESSES ============

    /**
     * Get user addresses
     */
    async getAddresses(userId: string): Promise<ApiResponse<AddressResponse[]>> {
        const addresses = await this.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
        });

        return successResponse(addresses);
    }

    /**
     * Create new address
     */
    async createAddress(
        userId: string,
        dto: CreateAddressDto,
    ): Promise<ApiResponse<AddressResponse>> {
        // If this is set as default, unset other defaults
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const address = await this.prisma.address.create({
            data: {
                ...dto,
                userId,
            },
        });

        this.logger.log(`Address created for user: ${userId}`);

        return createdResponse(address, MESSAGES.USER.ADDRESS_ADDED);
    }

    /**
     * Update address
     */
    async updateAddress(
        userId: string,
        addressId: string,
        dto: UpdateAddressDto,
    ): Promise<ApiResponse<AddressResponse>> {
        // Verify address belongs to user
        const existing = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });

        if (!existing) {
            throw new NotFoundException('Address');
        }

        // If setting as default, unset other defaults
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true, NOT: { id: addressId } },
                data: { isDefault: false },
            });
        }

        const address = await this.prisma.address.update({
            where: { id: addressId },
            data: dto,
        });

        return updatedResponse(address, MESSAGES.USER.ADDRESS_UPDATED);
    }

    /**
     * Delete address
     */
    async deleteAddress(
        userId: string,
        addressId: string,
    ): Promise<ApiResponse<null>> {
        // Verify address belongs to user
        const existing = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });

        if (!existing) {
            throw new NotFoundException('Address');
        }

        await this.prisma.address.delete({
            where: { id: addressId },
        });

        this.logger.log(`Address deleted for user: ${userId}`);

        return deletedResponse(MESSAGES.USER.ADDRESS_DELETED);
    }

    /**
     * Set address as default
     */
    async setDefaultAddress(
        userId: string,
        addressId: string,
    ): Promise<ApiResponse<AddressResponse>> {
        // Verify address belongs to user
        const existing = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });

        if (!existing) {
            throw new NotFoundException('Address');
        }

        // Unset other defaults
        await this.prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });

        // Set this as default
        const address = await this.prisma.address.update({
            where: { id: addressId },
            data: { isDefault: true },
        });

        return updatedResponse(address, MESSAGES.USER.ADDRESS_UPDATED);
    }

    // ============ ADMIN OPERATIONS ============

    /**
     * Admin: List all users
     */
    async listUsers(
        query: ListUsersQueryDto,
    ): Promise<ApiResponse<PaginatedResult<UserProfile>>> {
        const { page, limit, search, status, role } = query;
        const { skip, take } = calculatePagination(page, limit);

        const where = {
            ...(search && {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' as const } },
                    { lastName: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
            ...(status && { status }),
            ...(role && { role }),
        };

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    avatarUrl: true,
                    role: true,
                    status: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        const result = createPaginatedResult(users, total, page, limit);
        return successResponse(result);
    }

    /**
     * Admin: Get user by ID
     */
    async getUserById(userId: string): Promise<ApiResponse<UserProfile & { status: string; addresses: AddressResponse[] }>> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                role: true,
                status: true,
                createdAt: true,
                addresses: true,
            },
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return successResponse(user);
    }

    /**
     * Admin: Update user status
     */
    async updateUserStatus(
        userId: string,
        dto: UpdateUserStatusDto,
    ): Promise<ApiResponse<UserProfile & { status: string }>> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { status: dto.status },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        this.logger.log(`User ${userId} status updated to ${dto.status}`);

        return updatedResponse(user, MESSAGES.USER.STATUS_UPDATED(dto.status));
    }
}
