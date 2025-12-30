// Authentication Service

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma';
import {
    RegisterDto,
    LoginDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ChangePasswordDto,
} from './schemas';
import { GoogleProfile } from './strategies';
import {
    TokenPair,
    JwtPayload,
    ApiResponse,
    RequestUser,
} from '../../common/types';
import { MESSAGES } from '../../common/constants';
import {
    InvalidCredentialsException,
    EmailAlreadyExistsException,
    TokenExpiredException,
    AccountSuspendedException,
    UserNotFoundException,
} from '../../common/filters';
import { successResponse } from '../../common/helpers';
import { addDays, addMinutes } from '../../common/helpers';

const SALT_ROUNDS = 10;

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    tokens: TokenPair;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Register a new user
     */
    async register(dto: RegisterDto): Promise<ApiResponse<AuthResponse>> {
        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new EmailAlreadyExistsException();
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                status: 'ACTIVE', // For now, skip email verification
                emailVerified: true,
            },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        this.logger.log(`User registered: ${user.email}`);

        return successResponse(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                tokens,
            },
            MESSAGES.AUTH.REGISTER_SUCCESS,
        );
    }

    /**
     * Login with email and password
     */
    async login(dto: LoginDto): Promise<ApiResponse<AuthResponse>> {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !user.passwordHash) {
            throw new InvalidCredentialsException();
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new InvalidCredentialsException();
        }

        // Check user status
        if (user.status === 'SUSPENDED') {
            throw new AccountSuspendedException();
        }

        if (user.status !== 'ACTIVE') {
            throw new InvalidCredentialsException();
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        this.logger.log(`User logged in: ${user.email}`);

        return successResponse(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                tokens,
            },
            MESSAGES.AUTH.LOGIN_SUCCESS,
        );
    }

    /**
     * Handle Google OAuth login/registration
     */
    async googleAuth(profile: GoogleProfile): Promise<ApiResponse<AuthResponse>> {
        // Check if user exists by Google ID or email
        let user = await this.prisma.user.findFirst({
            where: {
                OR: [{ googleId: profile.googleId }, { email: profile.email }],
            },
        });

        if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: profile.googleId },
                });
            }
        } else {
            // Create new user
            user = await this.prisma.user.create({
                data: {
                    email: profile.email,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    avatarUrl: profile.avatarUrl,
                    googleId: profile.googleId,
                    status: 'ACTIVE',
                    emailVerified: true,
                },
            });
        }

        // Check user status
        if (user.status === 'SUSPENDED') {
            throw new AccountSuspendedException();
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        this.logger.log(`Google auth successful: ${user.email}`);

        return successResponse(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                tokens,
            },
            MESSAGES.AUTH.LOGIN_SUCCESS,
        );
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<ApiResponse<TokenPair>> {
        // Find refresh token in database
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken) {
            throw new TokenExpiredException();
        }

        // Check if token is expired
        if (storedToken.expiresAt < new Date()) {
            // Delete expired token
            await this.prisma.refreshToken.delete({
                where: { id: storedToken.id },
            });
            throw new TokenExpiredException();
        }

        // Delete old token
        await this.prisma.refreshToken.delete({
            where: { id: storedToken.id },
        });

        // Generate new tokens
        const tokens = await this.generateTokens(
            storedToken.user.id,
            storedToken.user.email,
            storedToken.user.role,
        );

        return successResponse(tokens, MESSAGES.GENERAL.SUCCESS);
    }

    /**
     * Logout - invalidate refresh token
     */
    async logout(refreshToken: string): Promise<ApiResponse<null>> {
        await this.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });

        return successResponse(null, MESSAGES.AUTH.LOGOUT_SUCCESS);
    }

    /**
     * Change password
     */
    async changePassword(
        userId: string,
        dto: ChangePasswordDto,
    ): Promise<ApiResponse<null>> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.passwordHash) {
            throw new UserNotFoundException();
        }

        // Verify current password
        const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);

        if (!isValid) {
            throw new InvalidCredentialsException();
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

        // Update password
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        // Invalidate all refresh tokens
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        this.logger.log(`Password changed for user: ${user.email}`);

        return successResponse(null, MESSAGES.AUTH.PASSWORD_CHANGED);
    }

    /**
     * Request password reset
     */
    async forgotPassword(dto: ForgotPasswordDto): Promise<ApiResponse<null>> {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return successResponse(null, MESSAGES.AUTH.PASSWORD_RESET_SENT);
        }

        // TODO: Generate reset token and send email
        // For now, just log
        this.logger.log(`Password reset requested for: ${dto.email}`);

        return successResponse(null, MESSAGES.AUTH.PASSWORD_RESET_SENT);
    }

    /**
     * Get current user profile
     */
    async getProfile(userId: string): Promise<ApiResponse<RequestUser & { firstName: string; lastName: string }>> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return successResponse({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        });
    }

    /**
     * Generate access and refresh tokens
     */
    private async generateTokens(
        userId: string,
        email: string,
        role: string,
    ): Promise<TokenPair> {
        const payload: JwtPayload = {
            sub: userId,
            email,
            role,
        };

        const accessToken = this.jwtService.sign(payload);

        // Generate refresh token
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('jwt.refreshSecret'),
            expiresIn: '7d',
        });

        // Store refresh token in database
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt: addDays(new Date(), 7),
            },
        });

        return { accessToken, refreshToken };
    }
}
