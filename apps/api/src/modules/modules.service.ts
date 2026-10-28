import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ModuleData = {
  title?: string;
  order?: number;
  videoUrl?: string | null;
  content?: string | null;
  isFreePreview?: boolean;
};

type CreateModuleData = Omit<ModuleData, 'title'> & { title: string };

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  // Verifikasi kepemilikan kelas
  private async verifyClassOwnership(
    classId: string,
    userId: string,
    role: Role,
  ) {
    const course = await this.prisma.class.findUnique({
      where: { id: classId },
    });
    if (!course) throw new NotFoundException('Kelas tidak ditemukan');

    if (role !== Role.ADMIN && course.instructorId !== userId) {
      throw new ForbiddenException('Anda bukan instruktur untuk kelas ini');
    }
  }

  async create(
    classId: string,
    userId: string,
    role: Role,
    data: CreateModuleData,
  ) {
    await this.verifyClassOwnership(classId, userId, role);

    // Hitung urutan terakhir
    const lastModule = await this.prisma.module.findFirst({
      where: { classId },
      orderBy: { order: 'desc' },
    });
    const order = lastModule ? lastModule.order + 1 : 1;

    return this.prisma.module.create({
      data: {
        title: data.title,
        videoUrl: data.videoUrl,
        content: data.content,
        isFreePreview: data.isFreePreview,
        classId,
        order,
      },
    });
  }

  async update(id: string, userId: string, role: Role, data: ModuleData) {
    const existingModule = await this.prisma.module.findUnique({
      where: { id },
    });
    if (!existingModule) throw new NotFoundException('Modul tidak ditemukan');

    await this.verifyClassOwnership(existingModule.classId, userId, role);

    const updateData: ModuleData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.isFreePreview !== undefined)
      updateData.isFreePreview = data.isFreePreview;

    return this.prisma.module.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string, role: Role) {
    const existingModule = await this.prisma.module.findUnique({
      where: { id },
    });
    if (!existingModule) throw new NotFoundException('Modul tidak ditemukan');

    await this.verifyClassOwnership(existingModule.classId, userId, role);

    return this.prisma.module.delete({ where: { id } });
  }
}
