import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(instructorId: string, data: any) {
    let validCategoryId = data.categoryId;

    // Menangkap string kosong, undefined, atau nilai yang bukan string
    if (!validCategoryId || typeof validCategoryId !== 'string') {
      const defaultCategory = await this.prisma.category.findFirst();
      if (!defaultCategory) {
        throw new Error('Kategori tidak ditemukan. Pastikan sudah melakukan seeding.');
      }
      validCategoryId = defaultCategory.id;
    }

    const baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;

    return this.prisma.class.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        level: data.level,
        price: Number(data.price),
        status: 'DRAFT',
        categoryId: validCategoryId,
        instructorId,
      },
    });
  }

  async findInstructorClassById(id: string, instructorId: string, role: Role) {
    const course = await this.prisma.class.findUnique({
      where: role === Role.ADMIN ? { id } : { id, instructorId },
      include: {
        modules: { orderBy: { order: 'asc' } },
        quizzes: { include: { questions: true } }
      }
    });
    
    if (!course) throw new NotFoundException('Kelas tidak ditemukan atau Anda tidak memiliki akses');
    return course;
  }

  async findInstructorClasses(instructorId: string, role: Role) {
    return this.prisma.class.findMany({
      where: role === Role.ADMIN ? {} : { instructorId },
      include: {
        _count: { select: { modules: true, enrollments: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPublished() {
    return this.prisma.class.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        instructor: { select: { name: true, profilePicture: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { modules: true, enrollments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.class.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: {
        category: true,
        instructor: { select: { name: true, profilePicture: true } },
        modules: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            isFreePreview: true,
          }
        },
      },
    });

    if (!course) throw new NotFoundException('Kelas tidak ditemukan');
    return course;
  }

  async publishClass(id: string, instructorId: string, role: Role) {
    const course = await this.prisma.class.findUnique({
      where: role === Role.ADMIN ? { id } : { id, instructorId },
      include: {
        _count: { select: { modules: true } }
      }
    });

    if (!course) {
      throw new NotFoundException('Kelas tidak ditemukan atau Anda tidak memiliki akses');
    }

    if (course._count.modules === 0) {
      throw new BadRequestException('Kelas harus memiliki setidaknya satu modul sebelum diterbitkan');
    }

    return this.prisma.class.update({
      where: { id },
      data: { status: 'PUBLISHED' }
    });
  }
}