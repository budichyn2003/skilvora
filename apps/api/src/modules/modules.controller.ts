import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

type AuthenticatedRequest = { user: { id: string; role: Role } };

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.INSTRUCTOR)
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post('class/:classId')
  create(
    @Param('classId') classId: string,
    @Body() createModuleDto: any,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.modulesService.create(classId, req.user.id, req.user.role, createModuleDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateModuleDto: any,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.modulesService.update(id, req.user.id, req.user.role, updateModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.modulesService.remove(id, req.user.id, req.user.role);
  }
}