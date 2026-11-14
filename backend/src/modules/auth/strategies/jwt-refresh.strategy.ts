import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => ((req as unknown as { cookies?: Record<string, string> }).cookies?.refreshToken ?? null),
        (req: Request) => ((req as unknown as { body?: Record<string, unknown> }).body?.refreshToken as string ?? null),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret') || '',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; type: string }) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const refreshToken = ((req as unknown as { cookies?: Record<string, string> }).cookies?.refreshToken) ||
                         ((req as unknown as { body?: Record<string, unknown> }).body?.refreshToken as string);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { refreshTokens: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = storedToken.user;
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const { passwordHash, refreshTokens, ...result } = user;
    return { ...result, refreshToken };
  }
}