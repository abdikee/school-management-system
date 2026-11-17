import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search records available to the current user' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'At least 2 characters' })
  async search(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Query('q') query?: string,
  ) {
    const normalizedQuery = query?.trim() ?? '';
    if (normalizedQuery.length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }

    return this.searchService.search(normalizedQuery, userId, role);
  }
}
