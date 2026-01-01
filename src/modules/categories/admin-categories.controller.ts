// Admin Categories Controller

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
    createCategorySchema,
    updateCategorySchema,
    listCategoriesQuerySchema,
} from './schemas';
import type {
    CreateCategoryDto,
    UpdateCategoryDto,
    ListCategoriesQueryDto,
} from './schemas';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { ZodValidationPipe } from '../../common/pipes';
import { Roles } from '../../common/decorators';
import { uuidSchema } from '../../common/schemas';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminCategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    /**
     * List all categories
     * GET /api/v1/admin/categories
     */
    @Get()
    async findAll(
        @Query(new ZodValidationPipe(listCategoriesQuerySchema))
        query: ListCategoriesQueryDto,
    ) {
        return this.categoriesService.findAll(query);
    }

    /**
     * Get category by ID
     * GET /api/v1/admin/categories/:id
     */
    @Get(':id')
    async findById(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.categoriesService.findById(id);
    }

    /**
     * Create category
     * POST /api/v1/admin/categories
     */
    @Post()
    async create(
        @Body(new ZodValidationPipe(createCategorySchema)) dto: CreateCategoryDto,
    ) {
        return this.categoriesService.create(dto);
    }

    /**
     * Update category
     * PUT /api/v1/admin/categories/:id
     */
    @Put(':id')
    async update(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
        @Body(new ZodValidationPipe(updateCategorySchema)) dto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, dto);
    }

    /**
     * Delete category
     * DELETE /api/v1/admin/categories/:id
     */
    @Delete(':id')
    async delete(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.categoriesService.delete(id);
    }

    /**
     * Toggle category active status
     * PUT /api/v1/admin/categories/:id/toggle-active
     */
    @Put(':id/toggle-active')
    async toggleActive(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.categoriesService.toggleActive(id);
    }
}
