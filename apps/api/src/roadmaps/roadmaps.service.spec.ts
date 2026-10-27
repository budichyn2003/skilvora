import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RoadmapsService } from './roadmaps.service';

describe('RoadmapsService', () => {
  let service: RoadmapsService;
  const prisma = {
    roadmap: { findMany: jest.fn(), findUnique: jest.fn() },
    class: { findMany: jest.fn() },
    enrollment: { findMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RoadmapsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(RoadmapsService);
  });

  it('requires a published roadmap to have a published class node', async () => {
    const transaction = {
      roadmap: { findUnique: jest.fn(), create: jest.fn() },
      class: { findMany: jest.fn().mockResolvedValue([]) },
      roadmapNode: { deleteMany: jest.fn(), createMany: jest.fn() },
    };
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    );

    await expect(
      service.saveRoadmap(null, {
        title: 'Web Development',
        status: PublishStatus.PUBLISHED,
        nodes: [{ classId: 'draft-class', title: 'Start here', order: 1 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction.roadmap.create).not.toHaveBeenCalled();
  });

  it('validates sequential node ordering before writing', async () => {
    await expect(
      service.saveRoadmap(null, {
        title: 'Web Development',
        nodes: [{ classId: 'class-1', title: 'Start here', order: 3 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('maps active enrollment completion to roadmap node status', async () => {
    prisma.roadmap.findMany.mockResolvedValue([
      {
        id: 'roadmap-1',
        nodes: [
          { id: 'node-complete', classId: 'class-1' },
          { id: 'node-started', classId: 'class-2' },
          { id: 'node-locked', classId: 'class-3' },
        ],
      },
    ]);
    prisma.enrollment.findMany.mockResolvedValue([
      {
        classId: 'class-1',
        class: { id: 'class-1', _count: { modules: 2 } },
        progresses: [{ id: 'progress-1' }, { id: 'progress-2' }],
      },
      {
        classId: 'class-2',
        class: { id: 'class-2', _count: { modules: 2 } },
        progresses: [{ id: 'progress-3' }],
      },
    ]);

    const roadmaps = await service.getMyProgress('student-1');

    expect(roadmaps[0].nodes.map((node) => node.progress)).toEqual([
      'COMPLETED',
      'IN_PROGRESS',
      'LOCKED',
    ]);
  });
});
