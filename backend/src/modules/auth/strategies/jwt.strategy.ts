import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => ((req as unknown as { cookies?: Record<string, string> }).cookies?.accessToken ?? null),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || '',
    });
  }

  async validate(payload: { sub: string; email: string; role: UserRole }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        student: true,
        teacher: true,
        parent: true,
        refreshTokens: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Attach role-specific data
    const { passwordHash, refreshTokens, ...result } = user;
    return result;
  }
}