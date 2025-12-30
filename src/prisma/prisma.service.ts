// Prisma Service - Database client wrapper

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ],
        });
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Database connected successfully');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }

    /**
     * Clear all data from the database (for testing)
     */
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production');
        }

        // Delete in reverse order of dependencies
        await this.$transaction([
            this.collectionProduct.deleteMany(),
            this.collection.deleteMany(),
            this.page.deleteMany(),
            this.banner.deleteMany(),
            this.newsletterSubscriber.deleteMany(),
            this.review.deleteMany(),
            this.wishlistItem.deleteMany(),
            this.shipment.deleteMany(),
            this.payment.deleteMany(),
            this.orderItem.deleteMany(),
            this.order.deleteMany(),
            this.cartItem.deleteMany(),
            this.cart.deleteMany(),
            this.coupon.deleteMany(),
            this.productImage.deleteMany(),
            this.productVariant.deleteMany(),
            this.product.deleteMany(),
            this.category.deleteMany(),
            this.address.deleteMany(),
            this.refreshToken.deleteMany(),
            this.user.deleteMany(),
        ]);
    }
}
