import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClassLevel, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateCourseData {
  title!: string;
  description?: string;
  level?: ClassLevel;
  price?: number;
  categoryId?: string;
}

export class CourseQueryData {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: ClassLevel;
}

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(instructorId: string, data: CreateCourseData) {
    let validCategoryId = data.categoryId;

    // Menangkap string kosong, undefined, atau nilai yang bukan string
    if (!validCategoryId || typeof validCategoryId !== 'string') {
      const defaultCategory = await this.prisma.category.findFirst();
      if (!defaultCategory) {
        throw new BadRequestException(
          'Kategori tidak ditemukan. Pastikan sudah melakukan seeding.',
        );
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
        level: data.level || ClassLevel.BEGINNER,
        price: Number(data.price || 0),
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
        quizzes: { include: { questions: true } },
      },
    });

    if (!course)
      throw new NotFoundException(
        'Kelas tidak ditemukan atau Anda tidak memiliki akses',
      );
    return course;
  }

  async findInstructorClasses(instructorId: string, role: Role) {
    return this.prisma.class.findMany({
      where: role === Role.ADMIN ? {} : { instructorId },
      include: {
        _count: { select: { modules: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPublished(query?: CourseQueryData) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query?.limit) || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ClassWhereInput = {
      status: 'PUBLISHED',
    };

    if (
      query?.search &&
      typeof query.search === 'string' &&
      query.search.trim()
    ) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (
      query?.category &&
      typeof query.category === 'string' &&
      query.category.trim()
    ) {
      where.category = {
        slug: query.category.trim(),
      };
    }

    if (query?.level && typeof query.level === 'string' && query.level.trim()) {
      where.level = query.level;
    }

    const [data, total, categories] = await Promise.all([
      this.prisma.class.findMany({
        where,
        include: {
          instructor: { select: { name: true, profilePicture: true } },
          category: { select: { name: true, slug: true } },
          _count: { select: { modules: true, enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.class.count({ where }),
      this.prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      categories,
    };
  }

  async getInstructorClassAnalytics(
    id: string,
    instructorId: string,
    role: Role,
  ) {
    const course = await this.prisma.class.findUnique({
      where: role === Role.ADMIN ? { id } : { id, instructorId },
      include: {
        _count: { select: { enrollments: true } },
        modules: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, order: true },
        },
        enrollments: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            userId: true,
            progresses: {
              select: {
                moduleId: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(
        'Kelas tidak ditemukan atau Anda tidak memiliki akses',
      );
    }

    const totalStudents = course._count.enrollments;
    const activeStudents = course.enrollments.length;
    const totalModules = course.modules.length;

    const moduleAnalytics = course.modules.map((mod) => {
      const completedCount = course.enrollments.filter((enrollment) =>
        enrollment.progresses.some(
          (p) => p.moduleId === mod.id && p.status === 'COMPLETED',
        ),
      ).length;

      const inProgressCount = course.enrollments.filter((enrollment) =>
        enrollment.progresses.some(
          (p) => p.moduleId === mod.id && p.status === 'IN_PROGRESS',
        ),
      ).length;

      const completionRate =
        activeStudents > 0
          ? Math.round((completedCount / activeStudents) * 1000) / 10
          : 0;

      const dropoffRate =
        activeStudents > 0
          ? Math.max(0, Math.round((100 - completionRate) * 10) / 10)
          : 0;

      return {
        id: mod.id,
        title: mod.title,
        order: mod.order,
        completedCount,
        inProgressCount,
        completionRate,
        dropoffRate,
      };
    });

    const completedAllCount =
      totalModules > 0
        ? course.enrollments.filter((enrollment) => {
            const completedModules = enrollment.progresses.filter(
              (p) => p.status === 'COMPLETED',
            );
            return completedModules.length >= totalModules;
          }).length
        : 0;

    const overallCompletionRate =
      activeStudents > 0
        ? Math.round((completedAllCount / activeStudents) * 1000) / 10
        : 0;

    return {
      classId: course.id,
      classTitle: course.title,
      totalStudents,
      activeStudents,
      totalModules,
      overallCompletionRate,
      modules: moduleAnalytics,
    };
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
          },
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
        _count: { select: { modules: true } },
      },
    });

    if (!course) {
      throw new NotFoundException(
        'Kelas tidak ditemukan atau Anda tidak memiliki akses',
      );
    }

    if (course._count.modules === 0) {
      throw new BadRequestException(
        'Kelas harus memiliki setidaknya satu modul sebelum diterbitkan',
      );
    }

    return this.prisma.class.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }
}
