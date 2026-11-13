import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshDto {
  @ApiPropertyOptional({ description: 'Refresh token (optional if sent via cookie)' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}