import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CoursesController],
  providers: [CoursesService, RolesGuard],
  exports: [CoursesService],
})
export class CoursesModule {}
