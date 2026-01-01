// Products Service - Matching Prisma schema

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import type {
    CreateProductDto,
    UpdateProductDto,
    ListProductsQueryDto,
    UpdateStockDto,
    CreateVariantDto,
    UpdateVariantDto,
} from './schemas';
import type { ApiResponse, PaginatedResult } from '../../common/types';
import { MESSAGES } from '../../common/constants';
import { ProductNotFoundException, NotFoundException } from '../../common/filters';
import {
    successResponse,
    createdResponse,
    updatedResponse,
    deletedResponse,
    createPaginatedResult,
    calculatePagination,
    generateSlug,
    generateSKU,
} from '../../common/helpers';

// Exported response types (using generic types for Decimal fields)
export interface ProductResponse {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    categoryId: string;
    gender: string;
    basePrice: unknown; // Prisma Decimal
    compareAtPrice: unknown | null;
    isFeatured: boolean;
    isActive: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductWithDetails extends ProductResponse {
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    variants?: VariantResponse[];
    images?: ProductImageResponse[];
}

export interface VariantResponse {
    id: string;
    sku: string;
    color: string;
    size: string;
    priceModifier: unknown;
    stockQuantity: number;
    lowStockThreshold: number;
    isActive: boolean;
}

export interface ProductImageResponse {
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
}

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new product
     */
    async create(dto: CreateProductDto): Promise<ApiResponse<ProductWithDetails>> {
        // Verify category exists
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });

        if (!category) {
            throw new NotFoundException('Category');
        }

        // Generate slug from name
        const baseSlug = generateSlug(dto.name);
        let slug = baseSlug;
        let counter = 1;

        while (await this.prisma.product.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const product = await this.prisma.product.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                shortDescription: dto.shortDescription,
                categoryId: dto.categoryId,
                gender: dto.gender ?? 'UNISEX',
                basePrice: dto.basePrice,
                compareAtPrice: dto.compareAtPrice,
                isFeatured: dto.isFeatured ?? false,
                isActive: dto.isActive ?? true,
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription,
            },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                variants: true,
                images: { orderBy: { sortOrder: 'asc' } },
            },
        });

        this.logger.log(`Product created: ${product.name}`);

        return createdResponse(product, MESSAGES.PRODUCT.CREATED);
    }

    /**
     * Get all products with filtering
     */
    async findAll(
        query: ListProductsQueryDto,
    ): Promise<ApiResponse<PaginatedResult<ProductWithDetails>>> {
        const {
            page,
            limit,
            search,
            categoryId,
            categorySlug,
            minPrice,
            maxPrice,
            gender,
            isActive,
            isFeatured,
            inStock,
            sortBy,
            sortOrder,
        } = query;
        const { skip, take } = calculatePagination(page, limit);

        // Resolve category ID from slug if needed
        let resolvedCategoryId = categoryId;
        if (categorySlug && !categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { slug: categorySlug },
            });
            resolvedCategoryId = category?.id;
        }

        // Build where clause
        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (resolvedCategoryId) where.categoryId = resolvedCategoryId;
        if (minPrice !== undefined) where.basePrice = { ...((where.basePrice as object) || {}), gte: minPrice };
        if (maxPrice !== undefined) where.basePrice = { ...((where.basePrice as object) || {}), lte: maxPrice };
        if (gender) where.gender = gender;
        if (isActive !== undefined) where.isActive = isActive;
        if (isFeatured !== undefined) where.isFeatured = isFeatured;
        if (inStock !== undefined) {
            where.variants = inStock
                ? { some: { stockQuantity: { gt: 0 } } }
                : { every: { stockQuantity: { lte: 0 } } };
        }

        // Map sortBy to actual field
        const orderByField = sortBy === 'price' ? 'basePrice' : sortBy;

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take,
                include: {
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                },
                orderBy: { [orderByField]: sortOrder },
            }),
            this.prisma.product.count({ where }),
        ]);

        const result = createPaginatedResult(products, total, page, limit);
        return successResponse(result);
    }

    /**
     * Get featured products
     */
    async findFeatured(limit: number = 8): Promise<ApiResponse<ProductWithDetails[]>> {
        const products = await this.prisma.product.findMany({
            where: {
                isFeatured: true,
                isActive: true,
                variants: { some: { stockQuantity: { gt: 0 } } },
            },
            take: limit,
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                images: {
                    where: { isPrimary: true },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse(products);
    }

    /**
     * Get product by ID
     */
    async findById(id: string): Promise<ApiResponse<ProductWithDetails>> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                variants: {
                    where: { isActive: true },
                    orderBy: [{ color: 'asc' }, { size: 'asc' }],
                },
                images: { orderBy: { sortOrder: 'asc' } },
            },
        });

        if (!product) {
            throw new ProductNotFoundException();
        }

        return successResponse(product);
    }

    /**
     * Get product by slug
     */
    async findBySlug(slug: string): Promise<ApiResponse<ProductWithDetails>> {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                variants: {
                    where: { isActive: true },
                    orderBy: [{ color: 'asc' }, { size: 'asc' }],
                },
                images: { orderBy: { sortOrder: 'asc' } },
            },
        });

        if (!product) {
            throw new ProductNotFoundException();
        }

        return successResponse(product);
    }

    /**
     * Update a product
     */
    async update(
        id: string,
        dto: UpdateProductDto,
    ): Promise<ApiResponse<ProductWithDetails>> {
        const existing = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new ProductNotFoundException();
        }

        // Verify new category exists if provided
        if (dto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) {
                throw new NotFoundException('Category');
            }
        }

        // Update slug if name changed
        let updateData: Record<string, unknown> = { ...dto };
        if (dto.name && dto.name !== existing.name) {
            const baseSlug = generateSlug(dto.name);
            let slug = baseSlug;
            let counter = 1;

            while (
                await this.prisma.product.findFirst({
                    where: { slug, NOT: { id } },
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            updateData = { ...updateData, slug };
        }

        const product = await this.prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                variants: true,
                images: { orderBy: { sortOrder: 'asc' } },
            },
        });

        this.logger.log(`Product updated: ${product.name}`);

        return updatedResponse(product, MESSAGES.PRODUCT.UPDATED);
    }

    /**
     * Delete a product
     */
    async delete(id: string): Promise<ApiResponse<null>> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new ProductNotFoundException();
        }

        await this.prisma.product.delete({
            where: { id },
        });

        this.logger.log(`Product deleted: ${product.name}`);

        return deletedResponse(MESSAGES.PRODUCT.DELETED);
    }

    /**
     * Toggle product active status
     */
    async toggleActive(id: string): Promise<ApiResponse<ProductResponse>> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new ProductNotFoundException();
        }

        const updated = await this.prisma.product.update({
            where: { id },
            data: { isActive: !product.isActive },
        });

        this.logger.log(
            `Product ${updated.name} ${updated.isActive ? 'activated' : 'deactivated'}`,
        );

        return updatedResponse(
            updated,
            updated.isActive
                ? 'Product activated successfully'
                : 'Product deactivated successfully',
        );
    }

    // ============ VARIANTS ============

    /**
     * Add variant to product
     */
    async addVariant(
        productId: string,
        dto: CreateVariantDto,
    ): Promise<ApiResponse<VariantResponse>> {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { category: { select: { name: true } } },
        });

        if (!product) {
            throw new ProductNotFoundException();
        }

        // Generate SKU
        const sku = dto.sku || generateSKU(product.category.name, dto.color, dto.size);

        const variant = await this.prisma.productVariant.create({
            data: {
                productId,
                sku,
                color: dto.color,
                size: dto.size,
                priceModifier: dto.priceModifier ?? 0,
                stockQuantity: dto.stockQuantity ?? 0,
                lowStockThreshold: dto.lowStockThreshold ?? 5,
                isActive: dto.isActive ?? true,
            },
        });

        this.logger.log(`Variant added to product ${product.name}`);

        return createdResponse(variant, MESSAGES.PRODUCT.VARIANT_ADDED);
    }

    /**
     * Update variant
     */
    async updateVariant(
        productId: string,
        variantId: string,
        dto: UpdateVariantDto,
    ): Promise<ApiResponse<VariantResponse>> {
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });

        if (!variant) {
            throw new NotFoundException('Variant');
        }

        const updated = await this.prisma.productVariant.update({
            where: { id: variantId },
            data: dto,
        });

        return updatedResponse(updated, MESSAGES.PRODUCT.VARIANT_UPDATED);
    }

    /**
     * Delete variant
     */
    async deleteVariant(
        productId: string,
        variantId: string,
    ): Promise<ApiResponse<null>> {
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });

        if (!variant) {
            throw new NotFoundException('Variant');
        }

        await this.prisma.productVariant.delete({
            where: { id: variantId },
        });

        return deletedResponse(MESSAGES.PRODUCT.VARIANT_DELETED);
    }

    /**
     * Update variant stock
     */
    async updateVariantStock(
        productId: string,
        variantId: string,
        dto: UpdateStockDto,
    ): Promise<ApiResponse<VariantResponse>> {
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });

        if (!variant) {
            throw new NotFoundException('Variant');
        }

        const updated = await this.prisma.productVariant.update({
            where: { id: variantId },
            data: { stockQuantity: dto.stockQuantity },
        });

        this.logger.log(`Stock updated for variant ${variantId}: ${dto.stockQuantity}`);

        return updatedResponse(updated, MESSAGES.PRODUCT.STOCK_UPDATED);
    }
}
