// Products Controller - Public endpoints

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { listProductsQuerySchema } from './schemas';
import type { ListProductsQueryDto } from './schemas';
import { Public } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import { slugSchema } from '../../common/schemas';

@Controller('public/products')
@Public()
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    /**
     * Get products with filtering
     * GET /api/v1/public/products
     */
    @Get()
    async findAll(
        @Query(new ZodValidationPipe(listProductsQuerySchema))
        query: ListProductsQueryDto,
    ) {
        return this.productsService.findAll(query);
    }

    /**
     * Get featured products
     * GET /api/v1/public/products/featured
     */
    @Get('featured')
    async findFeatured(@Query('limit') limit?: number) {
        return this.productsService.findFeatured(limit);
    }

    /**
     * Get product by slug
     * GET /api/v1/public/products/:slug
     */
    @Get(':slug')
    async findBySlug(
        @Param('slug', new ZodValidationPipe(slugSchema)) slug: string,
    ) {
        return this.productsService.findBySlug(slug);
    }
}
