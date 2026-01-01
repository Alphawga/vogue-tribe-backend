// Categories Service - Simplified to match Prisma schema

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import type {
    CreateCategoryDto,
    UpdateCategoryDto,
    ListCategoriesQueryDto,
} from './schemas';
import type { ApiResponse, PaginatedResult } from '../../common/types';
import { NotFoundException, BadRequestException } from '../../common/filters';
import {
    successResponse,
    createdResponse,
    updatedResponse,
    deletedResponse,
    createPaginatedResult,
    calculatePagination,
    generateSlug,
} from '../../common/helpers';

// Exported response types matching Prisma schema
export interface CategoryResponse {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
}

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new category
     */
    async create(dto: CreateCategoryDto): Promise<ApiResponse<CategoryResponse>> {
        // Generate slug from name
        const baseSlug = generateSlug(dto.name);
        let slug = baseSlug;
        let counter = 1;

        // Ensure unique slug
        while (await this.prisma.category.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const category = await this.prisma.category.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                imageUrl: dto.imageUrl,
                isActive: dto.isActive ?? true,
            },
        });

        this.logger.log(`Category created: ${category.name}`);

        return createdResponse(category, 'Category created successfully');
    }

    /**
     * Get all categories with optional filtering
     */
    async findAll(
        query: ListCategoriesQueryDto,
    ): Promise<ApiResponse<PaginatedResult<CategoryResponse>>> {
        const { page, limit, search, isActive } = query;
        const { skip, take } = calculatePagination(page, limit);

        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
            ...(isActive !== undefined && { isActive }),
        };

        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                skip,
                take,
                orderBy: { sortOrder: 'asc' },
            }),
            this.prisma.category.count({ where }),
        ]);

        const result = createPaginatedResult(categories, total, page, limit);
        return successResponse(result);
    }

    /**
     * Get all active categories
     */
    async findAllActive(): Promise<ApiResponse<CategoryResponse[]>> {
        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });

        return successResponse(categories);
    }

    /**
     * Get category by ID
     */
    async findById(id: string): Promise<ApiResponse<CategoryResponse>> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException('Category');
        }

        return successResponse(category);
    }

    /**
     * Get category by slug
     */
    async findBySlug(slug: string): Promise<ApiResponse<CategoryResponse>> {
        const category = await this.prisma.category.findUnique({
            where: { slug },
        });

        if (!category) {
            throw new NotFoundException('Category');
        }

        return successResponse(category);
    }

    /**
     * Update a category
     */
    async update(
        id: string,
        dto: UpdateCategoryDto,
    ): Promise<ApiResponse<CategoryResponse>> {
        // Check if category exists
        const existing = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Category');
        }

        // Update slug if name changed
        let updateData: Record<string, unknown> = { ...dto };
        if (dto.name && dto.name !== existing.name) {
            const baseSlug = generateSlug(dto.name);
            let slug = baseSlug;
            let counter = 1;

            while (
                await this.prisma.category.findFirst({
                    where: { slug, NOT: { id } },
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            updateData = { ...updateData, slug };
        }

        const category = await this.prisma.category.update({
            where: { id },
            data: updateData,
        });

        this.logger.log(`Category updated: ${category.name}`);

        return updatedResponse(category, 'Category updated successfully');
    }

    /**
     * Delete a category
     */
    async delete(id: string): Promise<ApiResponse<null>> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                products: { select: { id: true } },
            },
        });

        if (!category) {
            throw new NotFoundException('Category');
        }

        // Check for products
        if (category.products.length > 0) {
            throw new BadRequestException(
                'Cannot delete category with products. Please reassign products first.',
            );
        }

        await this.prisma.category.delete({
            where: { id },
        });

        this.logger.log(`Category deleted: ${category.name}`);

        return deletedResponse('Category deleted successfully');
    }

    /**
     * Toggle category active status
     */
    async toggleActive(id: string): Promise<ApiResponse<CategoryResponse>> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException('Category');
        }

        const updated = await this.prisma.category.update({
            where: { id },
            data: { isActive: !category.isActive },
        });

        this.logger.log(
            `Category ${updated.name} ${updated.isActive ? 'activated' : 'deactivated'}`,
        );

        return updatedResponse(
            updated,
            updated.isActive
                ? 'Category activated successfully'
                : 'Category deactivated successfully',
        );
    }
}
