import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  // Verifikasi kepemilikan kelas
  private async verifyClassOwnership(classId: string, userId: string, role: Role) {
    const course = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!course) throw new NotFoundException('Kelas tidak ditemukan');
    
    if (role !== Role.ADMIN && course.instructorId !== userId) {
      throw new ForbiddenException('Anda bukan instruktur untuk kelas ini');
    }
  }

  async create(classId: string, userId: string, role: Role, data: any) {
    await this.verifyClassOwnership(classId, userId, role);
    
    // Hitung urutan terakhir
    const lastModule = await this.prisma.module.findFirst({
      where: { classId },
      orderBy: { order: 'desc' },
    });
    const order = lastModule ? lastModule.order + 1 : 1;

    return this.prisma.module.create({
      data: {
        ...data,
        classId,
        order,
      },
    });
  }

  async update(id: string, userId: string, role: Role, data: any) {
    const existingModule = await this.prisma.module.findUnique({ where: { id } });
    if (!existingModule) throw new NotFoundException('Modul tidak ditemukan');
    
    await this.verifyClassOwnership(existingModule.classId, userId, role);

    return this.prisma.module.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, role: Role) {
    const existingModule = await this.prisma.module.findUnique({ where: { id } });
    if (!existingModule) throw new NotFoundException('Modul tidak ditemukan');
    
    await this.verifyClassOwnership(existingModule.classId, userId, role);

    return this.prisma.module.delete({ where: { id } });
  }
}