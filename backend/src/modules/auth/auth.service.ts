import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus, Prisma } from '@prisma/client';
import { StudentRegistrationDto } from './dto/student-registration.dto';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    metadata: { ipAddress?: string; userAgent?: string } = {},
  ): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        teacher: true,
        parent: true,
      },
    });

    if (!user) {
      await this.recordLoginAttempt(email, false, 'USER_NOT_FOUND', metadata);
      return null;
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.recordLoginAttempt(email, false, 'ACCOUNT_LOCKED', {
        ...metadata,
        userId: user.id,
      });
      throw new UnauthorizedException('Account is temporarily locked. Try again later.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this.recordLoginAttempt(email, false, 'ACCOUNT_NOT_ACTIVE', {
        ...metadata,
        userId: user.id,
      });
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.registerFailedLogin(user.id, email, metadata);
      return null;
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastActivityAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
    await this.recordLoginAttempt(email, true, undefined, { ...metadata, userId: user.id });

    const { passwordHash, ...result } = user;
    return result;
  }

  private async registerFailedLogin(
    userId: string,
    email: string,
    metadata: { ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const maxAttempts = Number(this.configService.get('auth.maxFailedLoginAttempts') || 5);
    const lockMinutes = Number(this.configService.get('auth.lockoutMinutes') || 15);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount: { increment: 1 } },
      select: { failedLoginCount: true },
    });
    const shouldLock = user.failedLoginCount >= maxAttempts;
    if (shouldLock) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lockedUntil: new Date(Date.now() + lockMinutes * 60 * 1000) },
      });
    }
    await this.recordLoginAttempt(email, false, shouldLock ? 'ACCOUNT_LOCKED' : 'INVALID_PASSWORD', {
      ...metadata,
      userId,
    });
  }

  private async recordLoginAttempt(
    email: string,
    successful: boolean,
    failureReason?: string,
    metadata: { ipAddress?: string; userAgent?: string; userId?: string } = {},
  ): Promise<void> {
    await this.prisma.loginAttempt.create({
      data: {
        email,
        userId: metadata.userId,
        successful,
        failureReason,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      },
    });
  }

  async login(user: any): Promise<AuthTokens> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    schoolId?: string;
  }): Promise<AuthTokens> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        schoolId: data.schoolId,
        status: UserStatus.ACTIVE,
        emailVerified: true, // For development, auto-verify
      },
      include: {
        student: true,
        teacher: true,
        parent: true,
      },
    });

    return this.login(user);
  }

  async registerStudent(data: StudentRegistrationDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const studentId = await this.generateStudentId();

    await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: UserRole.STUDENT,
          status: UserStatus.PENDING,
          emailVerified: false,
        },
      });

      await transaction.student.create({
        data: {
          userId: user.id,
          studentId,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          status: UserStatus.PENDING,
        },
      });
    });

    return {
      message: 'Registration submitted for school approval',
      studentId,
    };
  }

  private async generateStudentId() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `STU-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const existing = await this.prisma.student.findUnique({ where: { studentId: candidate } });
      if (!existing) return candidate;
    }

    throw new ConflictException('Unable to generate a student ID. Please try again.');
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
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

    if (storedToken.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    return this.login(storedToken.user);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoke all refresh tokens for user
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all refresh tokens to force re-login
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'User',
        entityId: user.id,
        newData: { status: 'delivery_not_configured' },
      },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload: { sub?: string; type?: string };
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (payload.type !== 'password-reset' || !payload.sub) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: payload.sub, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.prisma.auditLog.create({
      data: {
        userId: payload.sub,
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: payload.sub,
        newData: { status: 'completed' },
      },
    });
  }

  async acceptInvitation(token: string, newPassword: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash },
    });

    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired invitation');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: invitation.userId },
        data: {
          passwordHash,
          status: UserStatus.ACTIVE,
          emailVerified: true,
        },
      }),
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'email-verification') {
        throw new UnauthorizedException('Invalid verification token');
      }

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { emailVerified: true },
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        teacher: true,
        parent: true,
        refreshTokens: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, refreshTokens, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, data: Partial<Prisma.UserUpdateInput>) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        student: true,
        teacher: true,
        parent: true,
        refreshTokens: true,
      },
    });

    const { passwordHash, refreshTokens, ...result } = user;
    return result;
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    const token = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { secret: refreshSecret, expiresIn: refreshExpiresIn },
    );

    // Calculate expiry date
    const expiryMs = this.parseExpiry(refreshExpiresIn);
    const expiresAt = new Date(Date.now() + expiryMs);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}