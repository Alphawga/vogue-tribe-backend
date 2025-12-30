// Authentication Controller

import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type AuthResponse } from './auth.service';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    changePasswordSchema,
} from './schemas';
import type {
    RegisterDto,
    LoginDto,
    RefreshTokenDto,
    ForgotPasswordDto,
    ChangePasswordDto,
} from './schemas';
import { JwtAuthGuard, GoogleAuthGuard } from './guards';
import type { GoogleProfile } from './strategies';
import { ZodValidationPipe } from '../../common/pipes';
import { CurrentUser, Public } from '../../common/decorators';
import type { RequestUser, ApiResponse, TokenPair } from '../../common/types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Register a new user
     * POST /api/v1/auth/register
     */
    @Public()
    @Post('register')
    async register(
        @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
    ): Promise<ApiResponse<AuthResponse>> {
        return this.authService.register(dto);
    }

    /**
     * Login with email and password
     * POST /api/v1/auth/login
     */
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    ): Promise<ApiResponse<AuthResponse>> {
        return this.authService.login(dto);
    }

    /**
     * Initiate Google OAuth
     * GET /api/v1/auth/google
     */
    @Public()
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(): Promise<void> {
        // Guard redirects to Google
    }

    /**
     * Google OAuth callback
     * GET /api/v1/auth/google/callback
     */
    @Public()
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@Req() req: Request): Promise<ApiResponse<AuthResponse>> {
        const profile = req.user as GoogleProfile;
        return this.authService.googleAuth(profile);
    }

    /**
     * Refresh access token
     * POST /api/v1/auth/refresh-token
     */
    @Public()
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto,
    ): Promise<ApiResponse<TokenPair>> {
        return this.authService.refreshToken(dto.refreshToken);
    }

    /**
     * Logout - invalidate refresh token
     * POST /api/v1/auth/logout
     */
    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto,
    ): Promise<ApiResponse<null>> {
        return this.authService.logout(dto.refreshToken);
    }

    /**
     * Get current user profile
     * GET /api/v1/auth/me
     */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@CurrentUser() user: RequestUser) {
        return this.authService.getProfile(user.id);
    }

    /**
     * Change password
     * POST /api/v1/auth/change-password
     */
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @CurrentUser() user: RequestUser,
        @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto,
    ): Promise<ApiResponse<null>> {
        return this.authService.changePassword(user.id, dto);
    }

    /**
     * Request password reset
     * POST /api/v1/auth/forgot-password
     */
    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(
        @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordDto,
    ): Promise<ApiResponse<null>> {
        return this.authService.forgotPassword(dto);
    }
}
