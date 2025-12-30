// Application configuration

import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
}));

export const jwtConfig = registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

export const googleConfig = registerAs('google', () => ({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback',
}));

export const opayConfig = registerAs('opay', () => ({
    merchantId: process.env.OPAY_MERCHANT_ID || '',
    publicKey: process.env.OPAY_PUBLIC_KEY || '',
    secretKey: process.env.OPAY_SECRET_KEY || '',
    baseUrl: process.env.OPAY_BASE_URL || 'https://sandboxapi.opaycheckout.com',
}));

export const gigConfig = registerAs('gig', () => ({
    apiKey: process.env.GIG_API_KEY || '',
    baseUrl: process.env.GIG_BASE_URL || 'https://api.giglogistics.com',
}));

export const cloudinaryConfig = registerAs('cloudinary', () => ({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
}));

export const emailConfig = registerAs('email', () => ({
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@voguetribe.com',
}));

export const redisConfig = registerAs('redis', () => ({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
}));
