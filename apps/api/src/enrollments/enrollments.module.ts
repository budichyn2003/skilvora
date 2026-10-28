import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../auth/roles.guard';
import { ConfigModule } from '@nestjs/config';
import { PaymentProofStorageService } from './payment-proof-storage.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, PaymentProofStorageService, RolesGuard],
})
export class EnrollmentsModule {}
