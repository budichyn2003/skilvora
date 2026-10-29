import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from './courses.service';

describe('CoursesService', () => {
  let service: CoursesService;
  const prisma = {
    class: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [CoursesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(CoursesService);
  });

  it('scopes an instructor class lookup to the instructor', async () => {
    prisma.class.findUnique.mockResolvedValue(null);

    await expect(
      service.findInstructorClassById(
        'class-1',
        'instructor-2',
        Role.INSTRUCTOR,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.class.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'class-1', instructorId: 'instructor-2' },
      }),
    );
  });

  it('scopes instructor lists to the authenticated instructor', async () => {
    prisma.class.findMany.mockResolvedValue([]);

    await service.findInstructorClasses('instructor-2', Role.INSTRUCTOR);

    expect(prisma.class.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { instructorId: 'instructor-2' } }),
    );
  });

  it('allows admins to list classes across instructors', async () => {
    prisma.class.findMany.mockResolvedValue([]);

    await service.findInstructorClasses('admin-1', Role.ADMIN);

    expect(prisma.class.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('findAllPublished returns paginated data with meta and categories', async () => {
    const mockCourses = [{ id: 'c1', title: 'NestJS', status: 'PUBLISHED' }];
    prisma.class.findMany.mockResolvedValue(mockCourses);
    prisma.class.count.mockResolvedValue(1);
    prisma.category.findMany.mockResolvedValue([
      { id: 'cat1', name: 'Back-end', slug: 'backend' },
    ]);

    const result = await service.findAllPublished({ page: 1, limit: 12 });

    expect(result.data).toEqual(mockCourses);
    expect(result.meta).toMatchObject({
      page: 1,
      limit: 12,
      total: 1,
      totalPages: 1,
    });
    expect(result.categories).toHaveLength(1);
  });

  it('getInstructorClassAnalytics computes per-module completion rates', async () => {
    prisma.class.findUnique.mockResolvedValue({
      id: 'class-1',
      title: 'Test Class',
      instructorId: 'instructor-1',
      _count: { enrollments: 2 },
      modules: [
        { id: 'mod-1', title: 'Modul 1', order: 1 },
        { id: 'mod-2', title: 'Modul 2', order: 2 },
      ],
      enrollments: [
        {
          id: 'enr-1',
          userId: 'student-1',
          progresses: [
            { moduleId: 'mod-1', status: 'COMPLETED' },
            { moduleId: 'mod-2', status: 'IN_PROGRESS' },
          ],
        },
        {
          id: 'enr-2',
          userId: 'student-2',
          progresses: [{ moduleId: 'mod-1', status: 'COMPLETED' }],
        },
      ],
    });

    const result = await service.getInstructorClassAnalytics(
      'class-1',
      'instructor-1',
      Role.INSTRUCTOR,
    );

    expect(result.activeStudents).toBe(2);
    expect(result.modules).toHaveLength(2);
    // mod-1: both completed → 100%
    expect(result.modules[0].completionRate).toBe(100);
    // mod-2: 0 completed → 0%
    expect(result.modules[1].completionRate).toBe(0);
    expect(result.overallCompletionRate).toBe(0); // none completed all modules
  });

  it('findAllPublished returns paginated data with meta and categories', async () => {
    const mockCourses = [{ id: 'c1', title: 'NestJS', status: 'PUBLISHED' }];
    prisma.class.findMany.mockResolvedValue(mockCourses);
    prisma.class.count.mockResolvedValue(1);
    prisma.category.findMany.mockResolvedValue([{ id: 'cat1', name: 'Back-end', slug: 'backend' }]);

    const result = await service.findAllPublished({ page: 1, limit: 12 });

    expect(result.data).toEqual(mockCourses);
    expect(result.meta).toMatchObject({ page: 1, limit: 12, total: 1, totalPages: 1 });
    expect(result.categories).toHaveLength(1);
  });

  it('getInstructorClassAnalytics computes per-module completion rates', async () => {
    prisma.class.findUnique.mockResolvedValue({
      id: 'class-1',
      title: 'Test Class',
      instructorId: 'instructor-1',
      _count: { enrollments: 2 },
      modules: [
        { id: 'mod-1', title: 'Modul 1', order: 1 },
        { id: 'mod-2', title: 'Modul 2', order: 2 },
      ],
      enrollments: [
        {
          id: 'enr-1',
          userId: 'student-1',
          progresses: [
            { moduleId: 'mod-1', status: 'COMPLETED' },
            { moduleId: 'mod-2', status: 'IN_PROGRESS' },
          ],
        },
        {
          id: 'enr-2',
          userId: 'student-2',
          progresses: [
            { moduleId: 'mod-1', status: 'COMPLETED' },
          ],
        },
      ],
    });

    const result = await service.getInstructorClassAnalytics(
      'class-1',
      'instructor-1',
      Role.INSTRUCTOR,
    );

    expect(result.activeStudents).toBe(2);
    expect(result.modules).toHaveLength(2);
    // mod-1: both completed → 100%
    expect(result.modules[0].completionRate).toBe(100);
    // mod-2: 0 completed → 0%
    expect(result.modules[1].completionRate).toBe(0);
    expect(result.overallCompletionRate).toBe(0); // none completed all modules
  });
});
