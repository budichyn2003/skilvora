import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModulesService } from './modules.service';

describe('ModulesService', () => {
  let service: ModulesService;
  const prisma = {
    $transaction: jest.fn(),
    class: { findUnique: jest.fn() },
    module: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [ModulesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(ModulesService);
  });

  it('creates a module only in the authorized class with server-assigned order', async () => {
    prisma.class.findUnique.mockResolvedValue({
      id: 'class-1',
      instructorId: 'instructor-1',
    });
    prisma.module.findFirst.mockResolvedValue({ order: 2 });
    prisma.module.create.mockResolvedValue({ id: 'module-3' });

    await service.create('class-1', 'instructor-1', Role.INSTRUCTOR, {
      id: 'attacker-module',
      classId: 'class-2',
      order: 1,
      title: 'New module',
      videoUrl: null,
      content: 'Lesson',
      isFreePreview: true,
    });

    expect(prisma.module.create).toHaveBeenCalledWith({
      data: {
        title: 'New module',
        videoUrl: null,
        content: 'Lesson',
        isFreePreview: true,
        classId: 'class-1',
        order: 3,
      },
    });
  });

  it('does not allow an instructor to update another instructor’s module', async () => {
    prisma.module.findUnique.mockResolvedValue({
      id: 'module-1',
      classId: 'class-1',
    });
    prisma.class.findUnique.mockResolvedValue({
      id: 'class-1',
      instructorId: 'instructor-1',
    });

    await expect(
      service.update('module-1', 'instructor-2', Role.INSTRUCTOR, {
        title: 'Hijacked title',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.module.update).not.toHaveBeenCalled();
  });

  it('only updates editable module fields and ignores identity and ownership fields', async () => {
    prisma.module.findUnique.mockResolvedValue({
      id: 'module-1',
      classId: 'class-1',
    });
    prisma.class.findUnique.mockResolvedValue({
      id: 'class-1',
      instructorId: 'instructor-1',
    });
    prisma.module.update.mockResolvedValue({ id: 'module-1' });

    await service.update('module-1', 'instructor-1', Role.INSTRUCTOR, {
      id: 'module-2',
      classId: 'class-2',
      title: 'Updated title',
      order: 2,
      videoUrl: 'https://video.example/lesson',
      content: 'Lesson content',
      isFreePreview: true,
      createdAt: new Date('2020-01-01'),
    });

    expect(prisma.module.update).toHaveBeenCalledWith({
      where: { id: 'module-1' },
      data: {
        title: 'Updated title',
        order: 2,
        videoUrl: 'https://video.example/lesson',
        content: 'Lesson content',
        isFreePreview: true,
      },
    });
  });

  it('allows admins to edit modules while preserving module identity', async () => {
    prisma.module.findUnique.mockResolvedValue({
      id: 'module-1',
      classId: 'class-1',
    });
    prisma.class.findUnique.mockResolvedValue({
      id: 'class-1',
      instructorId: 'instructor-1',
    });
    prisma.module.update.mockResolvedValue({ id: 'module-1' });

    await service.update('module-1', 'admin-1', Role.ADMIN, {
      title: 'Admin edit',
      classId: 'class-2',
    });

    expect(prisma.module.update).toHaveBeenCalledWith({
      where: { id: 'module-1' },
      data: { title: 'Admin edit' },
    });
  });

  it('reorders modules within the class using a transaction', async () => {
    prisma.class.findUnique.mockResolvedValue({
      id: 'class-1',
      instructorId: 'instructor-1',
    });
    prisma.module.findMany
      .mockResolvedValueOnce([{ id: 'mod-1' }, { id: 'mod-2' }])
      .mockResolvedValueOnce([
        { id: 'mod-2', order: 1 },
        { id: 'mod-1', order: 2 },
      ]);
    prisma.module.update.mockResolvedValue({ id: 'mod-updated' });
    prisma.$transaction.mockResolvedValue([]);

    const result = await service.reorder(
      'class-1',
      'instructor-1',
      Role.INSTRUCTOR,
      ['mod-2', 'mod-1'],
    );

    expect(prisma.module.findMany).toHaveBeenCalledWith({
      where: { classId: 'class-1' },
      select: { id: true },
    });
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result).toEqual([
      { id: 'mod-2', order: 1 },
      { id: 'mod-1', order: 2 },
    ]);
  });
});
