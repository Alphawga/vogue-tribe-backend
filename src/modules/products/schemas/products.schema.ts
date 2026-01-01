// Products Zod Schemas - Matching Prisma schema

import { z } from 'zod';

/**
 * Create product schema - matching Prisma Product model
 */
export const createProductSchema = z.object({
    name: z
        .string()
        .min(2, 'Product name must be at least 2 characters')
        .max(200, 'Product name cannot exceed 200 characters')
        .trim(),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description cannot exceed 5000 characters'),
    shortDescription: z.string().max(500).optional().nullable(),
    categoryId: z.string().uuid('Invalid category ID'),
    gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).default('UNISEX'),
    basePrice: z
        .number()
        .positive('Base price must be positive')
        .multipleOf(0.01, 'Price must have at most 2 decimal places'),
    compareAtPrice: z
        .number()
        .positive('Compare at price must be positive')
        .multipleOf(0.01)
        .optional()
        .nullable(),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    metaTitle: z.string().max(100).optional().nullable(),
    metaDescription: z.string().max(300).optional().nullable(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

/**
 * Update product schema
 */
export const updateProductSchema = createProductSchema.partial();

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

/**
 * List products query schema
 */
export const listProductsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    categorySlug: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).optional(),
    isActive: z.coerce.boolean().optional(),
    isFeatured: z.coerce.boolean().optional(),
    inStock: z.coerce.boolean().optional(),
    sortBy: z
        .enum(['name', 'price', 'createdAt'])
        .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListProductsQueryDto = z.infer<typeof listProductsQuerySchema>;

/**
 * Update stock schema - for variant
 */
export const updateStockSchema = z.object({
    stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
});

export type UpdateStockDto = z.infer<typeof updateStockSchema>;

/**
 * Product variant schema - matching Prisma ProductVariant model
 */
export const createVariantSchema = z.object({
    sku: z.string().max(50).optional(),
    color: z.string().min(1, 'Color is required').max(50),
    size: z.string().min(1, 'Size is required').max(20),
    priceModifier: z.number().multipleOf(0.01).default(0),
    stockQuantity: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).default(5),
    isActive: z.boolean().default(true),
});

export type CreateVariantDto = z.infer<typeof createVariantSchema>;

export const updateVariantSchema = createVariantSchema.partial();

export type UpdateVariantDto = z.infer<typeof updateVariantSchema>;
