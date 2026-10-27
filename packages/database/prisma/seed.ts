import { PrismaClient, Role, PublishStatus, ClassLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding database...');

  const hashSeedPassword = async (variable: string) => {
    const password = process.env[variable];
    if (!password || password.length < 8) {
      throw new Error(`${variable} wajib diisi dengan password minimal 8 karakter`);
    }
    return bcrypt.hash(password, 10);
  };
  const adminPassword = await hashSeedPassword('SEED_ADMIN_PASSWORD');
  const instructorPassword = await hashSeedPassword('SEED_INSTRUCTOR_PASSWORD');
  const studentPassword = await hashSeedPassword('SEED_STUDENT_PASSWORD');

  // 1. Buat Akun Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skilvora.com' },
    update: { password: adminPassword, emailVerifiedAt: new Date() },
    create: {
      email: 'admin@skilvora.com',
      name: 'Admin Skilvora',
      password: adminPassword,
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instruktur@skilvora.com' },
    update: { password: instructorPassword, emailVerifiedAt: new Date() },
    create: {
      email: 'instruktur@skilvora.com',
      name: 'Kak Rangga (Instruktur)',
      password: instructorPassword,
      role: Role.INSTRUCTOR,
      emailVerifiedAt: new Date(),
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'siswa@skilvora.com' },
    update: { password: studentPassword, emailVerifiedAt: new Date() },
    create: {
      email: 'siswa@skilvora.com',
      name: 'Budi Cahyono',
      password: studentPassword,
      role: Role.STUDENT,
      emailVerifiedAt: new Date(),
    },
  });

  // 2. Buat Kategori
  const category = await prisma.category.upsert({
    where: { slug: 'frontend' },
    update: {},
    create: {
      name: 'Frontend Development',
      slug: 'frontend',
    },
  });

  // 3. Buat Kelas Publik
  const course = await prisma.class.upsert({
    where: { slug: 'html-css-dasar' },
    update: {},
    create: {
      title: 'HTML & CSS Dasar untuk Pemula',
      slug: 'html-css-dasar',
      description: 'Pelajari fondasi utama dalam membuat website. Kelas ini dirancang khusus untuk Anda yang belum pernah menulis kode sama sekali.',
      level: ClassLevel.BEGINNER,
      price: 0,
      status: PublishStatus.PUBLISHED,
      categoryId: category.id,
      instructorId: instructor.id,
    },
  });

  // 4. Buat Modul untuk Kelas
  await prisma.module.upsert({
    where: { classId_order: { classId: course.id, order: 1 } },
    update: {},
    create: {
      title: '1. Pengenalan Tag HTML',
      content: 'Dalam modul ini, kita akan membahas struktur dasar dari dokumen HTML5.',
      order: 1,
      classId: course.id,
      isFreePreview: true,
    },
  });

  // 5. Buat Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'full-stack-web-developer' },
    update: {},
    create: {
      title: 'Roadmap Full Stack Web Developer',
      slug: 'full-stack-web-developer',
      description: 'Jalur belajar terstruktur dari nol hingga menjadi Full Stack Web Developer siap kerja.',
      status: PublishStatus.PUBLISHED,
    },
  });

  // Sambungkan Kelas ke Roadmap Node
  await prisma.roadmapNode.upsert({
    where: { roadmapId_order: { roadmapId: roadmap.id, order: 1 } },
    update: {},
    create: {
      roadmapId: roadmap.id,
      classId: course.id,
      title: 'Tahap 1: Fondasi Frontend',
      order: 1,
    },
  });

  console.log('✅ Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });