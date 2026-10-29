import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Jadikan Global agar tidak perlu di-import berulang kali di module lain
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // INI YANG PENTING
})
export class PrismaModule {}
