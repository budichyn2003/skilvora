import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RoadmapsService } from './roadmaps.service';

type AuthenticatedRequest = { user: { id: string; role: Role } };

@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAllForAdmin() {
    return this.roadmapsService.findAllForAdmin();
  }

  @Get('admin/classes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  getPublishedClassOptions() {
    return this.roadmapsService.getPublishedClassOptions();
  }

  @Post('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() body: Parameters<RoadmapsService['saveRoadmap']>[1]) {
    return this.roadmapsService.saveRoadmap(null, body);
  }

  @Patch('admin/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() body: Parameters<RoadmapsService['saveRoadmap']>[1],
  ) {
    return this.roadmapsService.saveRoadmap(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.roadmapsService.deleteRoadmap(id);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  getMyProgress(@Req() request: AuthenticatedRequest) {
    return this.roadmapsService.getMyProgress(request.user.id);
  }

  @Get()
  findAll() {
    return this.roadmapsService.findAllPublished();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.roadmapsService.findBySlug(slug);
  }
}
