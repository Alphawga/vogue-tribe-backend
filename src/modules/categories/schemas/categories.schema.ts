// Categories Zod Schemas - Simplified (no hierarchy)

import { z } from 'zod';

/**
 * Create category schema
 */
export const createCategorySchema = z.object({
    name: z
        .string()
        .min(2, 'Category name must be at least 2 characters')
        .max(100, 'Category name cannot exceed 100 characters')
        .trim(),
    description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    imageUrl: z.string().url('Please provide a valid image URL').optional(),
    isActive: z.boolean().default(true),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

/**
 * Update category schema
 */
export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

/**
 * List categories query schema
 */
export const listCategoriesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
});

export type ListCategoriesQueryDto = z.infer<typeof listCategoriesQuerySchema>;
