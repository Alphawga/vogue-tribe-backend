// Google OAuth Strategy for Passport

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly configService: ConfigService) {
        const clientID = configService.get<string>('google.clientId');
        const clientSecret = configService.get<string>('google.clientSecret');
        const callbackURL = configService.get<string>('google.callbackUrl');

        super({
            clientID: clientID || 'placeholder',
            clientSecret: clientSecret || 'placeholder',
            callbackURL: callbackURL || 'http://localhost:3000/api/v1/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<void> {
        const { id, name, emails, photos } = profile;

        const googleProfile: GoogleProfile = {
            googleId: id,
            email: emails?.[0]?.value || '',
            firstName: name?.givenName || '',
            lastName: name?.familyName || '',
            avatarUrl: photos?.[0]?.value,
        };

        done(null, googleProfile);
    }
}
