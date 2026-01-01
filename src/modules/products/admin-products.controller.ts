// Admin Products Controller

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
import { ProductsService } from './products.service';
import {
    createProductSchema,
    updateProductSchema,
    listProductsQuerySchema,
    updateStockSchema,
    createVariantSchema,
    updateVariantSchema,
} from './schemas';
import type {
    CreateProductDto,
    UpdateProductDto,
    ListProductsQueryDto,
    UpdateStockDto,
    CreateVariantDto,
    UpdateVariantDto,
} from './schemas';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { ZodValidationPipe } from '../../common/pipes';
import { Roles } from '../../common/decorators';
import { uuidSchema } from '../../common/schemas';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminProductsController {
    constructor(private readonly productsService: ProductsService) { }

    /**
     * List all products
     * GET /api/v1/admin/products
     */
    @Get()
    async findAll(
        @Query(new ZodValidationPipe(listProductsQuerySchema))
        query: ListProductsQueryDto,
    ) {
        return this.productsService.findAll(query);
    }

    /**
     * Get product by ID
     * GET /api/v1/admin/products/:id
     */
    @Get(':id')
    async findById(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.productsService.findById(id);
    }

    /**
     * Create product
     * POST /api/v1/admin/products
     */
    @Post()
    async create(
        @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto,
    ) {
        return this.productsService.create(dto);
    }

    /**
     * Update product
     * PUT /api/v1/admin/products/:id
     */
    @Put(':id')
    async update(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
        @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductDto,
    ) {
        return this.productsService.update(id, dto);
    }

    /**
     * Delete product
     * DELETE /api/v1/admin/products/:id
     */
    @Delete(':id')
    async delete(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.productsService.delete(id);
    }

    /**
     * Toggle product active status
     * PUT /api/v1/admin/products/:id/toggle-active
     */
    @Put(':id/toggle-active')
    async toggleActive(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    ) {
        return this.productsService.toggleActive(id);
    }

    // ============ VARIANTS ============

    /**
     * Add variant to product
     * POST /api/v1/admin/products/:id/variants
     */
    @Post(':id/variants')
    async addVariant(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
        @Body(new ZodValidationPipe(createVariantSchema)) dto: CreateVariantDto,
    ) {
        return this.productsService.addVariant(id, dto);
    }

    /**
     * Update variant
     * PUT /api/v1/admin/products/:id/variants/:variantId
     */
    @Put(':id/variants/:variantId')
    async updateVariant(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
        @Param('variantId', new ZodValidationPipe(uuidSchema)) variantId: string,
        @Body(new ZodValidationPipe(updateVariantSchema)) dto: UpdateVariantDto,
    ) {
        return this.productsService.updateVariant(id, variantId, dto);
    }

    /**
     * Delete variant
     * DELETE /api/v1/admin/products/:id/variants/:variantId
     */
    @Delete(':id/variants/:variantId')
    async deleteVariant(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
        @Param('variantId', new ZodValidationPipe(uuidSchema)) variantId: string,
    ) {
        return this.productsService.deleteVariant(id, variantId);
    }

    /**
     * Update variant stock
     * PUT /api/v1/admin/products/:id/variants/:variantId/stock
     */
    @Put(':id/variants/:variantId/stock')
    async updateVariantStock(
        @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
        @Param('variantId', new ZodValidationPipe(uuidSchema)) variantId: string,
        @Body(new ZodValidationPipe(updateStockSchema)) dto: UpdateStockDto,
    ) {
        return this.productsService.updateVariantStock(id, variantId, dto);
    }
}
