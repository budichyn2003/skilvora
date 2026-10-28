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
});
