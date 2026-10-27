import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus, Prisma, PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type RoadmapNodeInput = { classId: string; title: string; order: number };
type RoadmapInput = {
  title: string;
  slug?: string;
  description?: string | null;
  status?: PublishStatus;
  nodes?: RoadmapNodeInput[];
};

@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublished() {
    return this.prisma.roadmap.findMany({
      where: { status: PublishStatus.PUBLISHED },
      include: {
        nodes: {
          where: { class: { is: { status: PublishStatus.PUBLISHED } } },
          orderBy: { order: 'asc' },
          include: {
            class: {
              select: {
                id: true,
                title: true,
                slug: true,
                level: true,
                thumbnail: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { slug, status: PublishStatus.PUBLISHED },
      include: {
        nodes: {
          where: { class: { is: { status: PublishStatus.PUBLISHED } } },
          orderBy: { order: 'asc' },
          include: {
            class: {
              select: {
                id: true,
                title: true,
                slug: true,
                level: true,
                thumbnail: true,
                description: true,
              },
            },
          },
        },
      },
    });
    if (!roadmap) throw new NotFoundException('Roadmap tidak ditemukan');
    return roadmap;
  }

  async findAllForAdmin() {
    return this.prisma.roadmap.findMany({
      include: {
        nodes: {
          orderBy: { order: 'asc' },
          include: {
            class: { select: { id: true, title: true, status: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getPublishedClassOptions() {
    return this.prisma.class.findMany({
      where: { status: PublishStatus.PUBLISHED },
      select: { id: true, title: true, slug: true, level: true },
      orderBy: { title: 'asc' },
    });
  }

  async deleteRoadmap(id: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!roadmap) throw new NotFoundException('Roadmap tidak ditemukan');
    if (roadmap.status === PublishStatus.PUBLISHED) {
      throw new BadRequestException(
        'Batalkan publikasi roadmap sebelum menghapusnya',
      );
    }
    return this.prisma.roadmap.delete({ where: { id } });
  }

  async saveRoadmap(id: string | null, input: RoadmapInput) {
    const title = input.title?.trim();
    if (!title) throw new BadRequestException('Judul roadmap wajib diisi');
    const slug = this.slugify(input.slug?.trim() || title);
    if (!slug) throw new BadRequestException('Slug roadmap tidak valid');
    const status = input.status || PublishStatus.DRAFT;
    if (!Object.values(PublishStatus).includes(status)) {
      throw new BadRequestException('Status roadmap tidak valid');
    }

    const nodes = input.nodes || [];
    if (
      nodes.some(
        (node, index) =>
          !node.classId ||
          !node.title?.trim() ||
          !Number.isInteger(node.order) ||
          node.order !== index + 1,
      ) ||
      new Set(nodes.map((node) => node.classId)).size !== nodes.length
    ) {
      throw new BadRequestException(
        'Node harus memiliki kelas unik dan urutan berurutan mulai dari 1',
      );
    }
    if (status === PublishStatus.PUBLISHED && nodes.length === 0) {
      throw new BadRequestException(
        'Roadmap harus memiliki setidaknya satu node sebelum diterbitkan',
      );
    }

    try {
      return await this.prisma.$transaction(async (transaction) => {
        if (
          id &&
          !(await transaction.roadmap.findUnique({
            where: { id },
            select: { id: true },
          }))
        ) {
          throw new NotFoundException('Roadmap tidak ditemukan');
        }
        const classIds = nodes.map((node) => node.classId);
        const publishedClasses = classIds.length
          ? await transaction.class.findMany({
              where: { id: { in: classIds }, status: PublishStatus.PUBLISHED },
              select: { id: true },
            })
          : [];
        if (publishedClasses.length !== classIds.length) {
          throw new BadRequestException(
            'Setiap node harus terkait kelas published',
          );
        }

        const roadmap = id
          ? await transaction.roadmap.update({
              where: { id },
              data: {
                title,
                slug,
                description: input.description?.trim() || null,
                status,
              },
            })
          : await transaction.roadmap.create({
              data: {
                title,
                slug,
                description: input.description?.trim() || null,
                status,
              },
            });
        await transaction.roadmapNode.deleteMany({
          where: { roadmapId: roadmap.id },
        });
        if (nodes.length) {
          await transaction.roadmapNode.createMany({
            data: nodes.map((node, index) => ({
              roadmapId: roadmap.id,
              classId: node.classId,
              title: node.title.trim(),
              order: index + 1,
            })),
          });
        }

        return transaction.roadmap.findUniqueOrThrow({
          where: { id: roadmap.id },
          include: {
            nodes: {
              orderBy: { order: 'asc' },
              include: {
                class: { select: { id: true, title: true, slug: true } },
              },
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Slug roadmap sudah digunakan');
      }
      throw error;
    }
  }

  async getMyProgress(userId: string) {
    const [roadmaps, enrollments] = await Promise.all([
      this.findAllPublished(),
      this.prisma.enrollment.findMany({
        where: { userId, status: EnrollmentStatus.ACTIVE },
        include: {
          class: {
            select: { id: true, _count: { select: { modules: true } } },
          },
          progresses: { where: { status: 'COMPLETED' }, select: { id: true } },
        },
      }),
    ]);
    const enrollmentByClass = new Map(
      enrollments.map((enrollment) => [enrollment.classId, enrollment]),
    );

    return roadmaps.map((roadmap) => ({
      ...roadmap,
      nodes: roadmap.nodes.map((node) => {
        const enrollment = enrollmentByClass.get(node.classId);
        if (!enrollment) return { ...node, progress: 'LOCKED' as const };
        if (
          enrollment.class._count.modules > 0 &&
          enrollment.progresses.length >= enrollment.class._count.modules
        ) {
          return { ...node, progress: 'COMPLETED' as const };
        }
        return {
          ...node,
          progress: enrollment.progresses.length
            ? ('IN_PROGRESS' as const)
            : ('ENROLLED' as const),
        };
      }),
    }));
  }

  private slugify(value: string) {
    return value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
