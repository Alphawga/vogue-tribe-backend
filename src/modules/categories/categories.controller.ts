// Categories Controller - Public endpoints

import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Public } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import { slugSchema } from '../../common/schemas';

@Controller('public/categories')
@Public()
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    /**
     * Get all active categories
     * GET /api/v1/public/categories
     */
    @Get()
    async findAllActive() {
        return this.categoriesService.findAllActive();
    }

    /**
     * Get category by slug
     * GET /api/v1/public/categories/:slug
     */
    @Get(':slug')
    async findBySlug(
        @Param('slug', new ZodValidationPipe(slugSchema)) slug: string,
    ) {
        return this.categoriesService.findBySlug(slug);
    }
}
