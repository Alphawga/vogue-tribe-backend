---
description: Backend architecture rules and API design guidelines for Vogue Tribe e-commerce
---

# Vogue Tribe Backend Architecture

This document defines the architecture, API design patterns, and development guidelines for the Vogue Tribe e-commerce backend.

## Tech Stack
- **Framework**: NestJS 11 (TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Google OAuth 2.0
- **Payment**: OPay
- **Shipping**: GIG Logistics
- **File Storage**: Cloudinary
- **Caching**: Redis
- **Email**: Resend

## API Structure

### Base URLs
```
/api/v1/public/*   → Public storefront APIs
/api/v1/admin/*    → Admin panel APIs (protected)
/api/v1/auth/*     → Authentication APIs
```

### Standard Response Format
```json
{
  "success": true,
  "data": { },
  "message": "Operation successful",
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

## Core Modules

1. **Authentication** - JWT, Google OAuth, password reset
2. **Users** - Profiles, addresses, admin management
3. **Products** - Catalog, variants, categories, images
4. **Inventory** - Stock tracking, low stock alerts
5. **Cart** - Guest/authenticated carts, coupon application
6. **Orders** - Checkout, order management, status tracking
7. **Payments** - OPay integration, webhooks, refunds
8. **Shipping** - GIG Logistics rates, booking, tracking
9. **Wishlist** - Save products for later
10. **Reviews** - Product ratings and reviews
11. **Coupons** - Discount codes and promotions
12. **CMS** - Banners, pages, featured collections
13. **Newsletter** - Subscriptions and campaigns
14. **Dashboard** - Admin analytics and stats

## Development Guidelines

### Project Structure
```
src/
├── common/         # Shared utilities, guards, decorators, helpers, schemas
├── config/         # Configuration modules
├── modules/        # Feature modules
├── prisma/         # Database schema
└── main.ts
```

### Coding Standards

#### 1. TypeScript Strict Typing
- **Never use `any` type** - all variables must be explicitly typed
- Define shared types in `src/common/types/`
- Use enums for constants (OrderStatus, UserRole, Gender)

#### 2. Zod Validation (NOT class-validator)
- All DTOs use Zod schemas with user-friendly error messages
- Schemas in `src/modules/*/schemas/` per module
- Use `ZodValidationPipe` in controllers

#### 3. DRY Principle
- Extract repeated logic into reusable helpers
- Shared helpers in `src/common/helpers/`
- Required helpers: pagination, price, slug, date, response

#### 4. User-Friendly Messages
- All response messages defined in `src/common/constants/messages.ts`
- Messages should be clear and actionable
- Use dynamic messages with interpolation where needed

### Naming Conventions
```
Files:       kebab-case      (product.service.ts)
Classes:     PascalCase      (ProductService)
Functions:   camelCase       (getProductById)
Constants:   SCREAMING_SNAKE (MAX_RETRY_ATTEMPTS)
DB tables:   snake_case      (product_variants)
Endpoints:   kebab-case      (/forgot-password)
```

### Security Rules
- Admin endpoints require admin role
- Rate limiting: 100 req/min auth, 20 req/min public
- JWT access tokens: 15min, refresh tokens: 7 days
- Input validation with Zod
- CORS, Helmet.js, request size limits

## Creating a New Module

1. Generate module: `nest g module modules/feature-name`
2. Generate controller: `nest g controller modules/feature-name`
3. Generate service: `nest g service modules/feature-name`
4. Create Zod schemas in `schemas/` folder
5. Add Prisma models if needed
6. Define types in `types/` folder
7. Write unit tests

## Running the Project

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Start development server
pnpm run start:dev

# Run tests
pnpm test
```
