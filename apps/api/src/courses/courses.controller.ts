import { Controller, Get, Param, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

type AuthenticatedRequest = { user: { id: string; role: Role } };

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ==========================================
  // 1. STATIC ROUTES (Harus diletakkan di atas)
  // ==========================================

  @Get()
  async findAll() {
    return this.coursesService.findAllPublished();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Get('instructor/my-classes')
  async getInstructorClasses(@Request() req: AuthenticatedRequest) {
    return this.coursesService.findInstructorClasses(req.user.id, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post('instructor/classes')
  async createClass(@Request() req: AuthenticatedRequest, @Body() data: any) {
    return this.coursesService.create(req.user.id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Get('instructor/classes/:id')
  async getInstructorClassById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.coursesService.findInstructorClassById(id, req.user.id, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Patch('instructor/classes/:id/publish')
  async publishClass(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.coursesService.publishClass(id, req.user.id, req.user.role);
  }

  // ==========================================
  // 2. DYNAMIC ROUTES (Harus diletakkan di bawah)
  // ==========================================

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }
}