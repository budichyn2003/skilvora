# Skilvora

Skilvora adalah platform belajar online untuk kelas coding dan teknologi informasi. Repository ini berisi aplikasi web, API, dan package database dalam satu monorepo pnpm/Turborepo.

## Teknologi

- **Monorepo:** pnpm workspace dan Turborepo
- **Frontend:** Next.js App Router, React, Tailwind CSS
- **Backend:** NestJS, Passport/JWT
- **Database:** PostgreSQL dengan Prisma
- **File bukti pembayaran:** Cloudflare R2 (fitur pembayaran tetap nonaktif sampai storage dikonfigurasi dan diuji)

## Struktur repository

```text
apps/
  api/                 NestJS API (default port 3001)
  web/                 Next.js web app (default port 3000)
packages/
  database/            Prisma schema, migrations, seed, dan shared Prisma Client
docs/                  Dokumentasi arsitektur, deployment, testing, dan readiness
render.yaml            Blueprint deployment API
pnpm-workspace.yaml    Definisi workspace pnpm
turbo.json             Pipeline Turborepo
```

Schema Prisma ada di `packages/database/prisma/schema.prisma`, bukan di `apps/api`.

## Prasyarat

- Node.js versi 20.9 atau lebih baru
- pnpm 9
- PostgreSQL untuk development lokal

Periksa versi yang tersedia:

```powershell
node --version
pnpm --version
```

## Menyiapkan development lokal

Jalankan perintah dari root repository.

### 1. Install dependency

```powershell
pnpm install
```

### 2. Atur environment

Buat file environment dari template hanya jika file tersebut belum ada. Jika sudah ada, jangan ditimpa—pertahankan nilainya dan edit yang diperlukan:

```powershell
if (-not (Test-Path packages/database/.env)) { Copy-Item .env.example packages/database/.env }
if (-not (Test-Path apps/api/.env)) { Copy-Item .env.example apps/api/.env }
if (-not (Test-Path apps/web/.env.local)) { Copy-Item apps/web/.env.example apps/web/.env.local }
```

Isi `DATABASE_URL` dan `DIRECT_URL` dengan koneksi PostgreSQL lokal pada kedua file backend/database. Jangan menyalin secret produksi atau staging ke environment lokal dan jangan commit file `.env`.

Nilai minimum untuk `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PAYMENTS_ENABLED=false
```

API menggunakan variabel di `.env.example`, termasuk `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `WEB_APP_URL`, dan konfigurasi SMTP. Untuk autentikasi email, isi konfigurasi SMTP dengan akun uji; jangan gunakan kredensial produksi untuk development.

### 3. Generate Prisma Client dan siapkan database lokal

Jalankan dari root repository:

```powershell
pnpm --filter @cahyodev/database db:generate
pnpm --filter @cahyodev/database db:push
```

Package Prisma adalah `@cahyodev/database`. Perintah seperti `pnpm --filter ./apps/api prisma generate` tidak valid karena `apps/api` tidak memiliki script bernama `prisma`.

`db:push` ditujukan hanya untuk database development lokal. Pastikan `DATABASE_URL` dan `DIRECT_URL` benar-benar menunjuk ke database lokal sebelum menjalankannya. Jangan gunakan `db:push` untuk database Neon/staging/production; deployment menggunakan migration yang sudah direview:

```powershell
pnpm --filter @cahyodev/database db:migrate:deploy
```

### 4. Seed data lokal (opsional)

Seed membuat akun admin, instruktur, siswa, kelas contoh, modul, dan roadmap. Seed juga **mengatur ulang password** akun seed berdasarkan environment, jadi jalankan hanya pada database lokal atau database staging yang memang disetujui untuk data demo. Jangan jalankan pada production.

Atur password demo minimal 8 karakter di `packages/database/.env` sebelum seed:

```env
SEED_ADMIN_PASSWORD=
SEED_INSTRUCTOR_PASSWORD=
SEED_STUDENT_PASSWORD=
```

Lalu jalankan:

```powershell
pnpm --filter @cahyodev/database db:seed
```

Package Prisma sudah mendaftarkan seed command (`ts-node prisma/seed.ts`). Karena itu perintah Prisma CLI `pnpm --filter @cahyodev/database exec prisma db seed` juga dapat digunakan. `npx prisma db seed` tanpa konfigurasi seed akan gagal; jalankan lewat package database agar Prisma menemukan `package.json` dan `.env` yang benar.

### 5. Jalankan aplikasi

```powershell
pnpm dev
```

Perintah tersebut menjalankan web dan API melalui Turborepo.

| Aplikasi | URL lokal |
|---|---|
| Web | <http://localhost:3000> |
| API | <http://localhost:3001> |

Untuk menjalankan satu aplikasi saja:

```powershell
pnpm --filter web dev
pnpm --filter api dev
```

## Perintah kerja umum

Jalankan dari root repository:

```powershell
pnpm --filter api test
pnpm --filter api build
pnpm --filter web build
pnpm --filter web lint
pnpm --filter @cahyodev/database db:studio
```

`pnpm --filter api` dan `pnpm --filter web` merujuk ke nama package dalam `apps/api/package.json` dan `apps/web/package.json`.

## Catatan pembayaran

Pembayaran dinonaktifkan secara default (`PAYMENTS_ENABLED=false` di API dan `NEXT_PUBLIC_PAYMENTS_ENABLED=false` di web). Jangan aktifkan pembayaran uang nyata sebelum bucket R2 privat dan credential API dikonfigurasi, upload/akses admin diuji, aturan retensi bukti ditetapkan, dan pemilik produk menyetujui peluncurannya. Variabel R2 yang tersedia ada di `.env.example`; isi nilainya hanya di environment deployment yang aman.

## Deployment

Deployment staging Skilvora saat ini:

- **Web:** <https://skilvora-omega.vercel.app>
- **API:** <https://skilvora-jvx9.onrender.com>

Untuk Vercel, gunakan root directory `apps/web` dan set `NEXT_PUBLIC_API_URL` ke URL API environment yang sesuai. Untuk Render, konfigurasi backend dan environment variable harus mengikuti [docs/STAGING-SETUP.md](./docs/STAGING-SETUP.md) dan [docs/deployment.md](./docs/deployment.md). Jangan gunakan URL staging atau data demo untuk production.

Sebelum menerima pengguna atau pembayaran nyata, ikuti checklist [docs/RELEASE-READINESS.md](./docs/RELEASE-READINESS.md). Status deployment dapat berubah; README ini bukan bukti bahwa production sudah siap.

## Dokumentasi

- [Arsitektur](./docs/architecture.md)
- [Setup staging](./docs/STAGING-SETUP.md)
- [Testing runbook](./docs/testing-runbook.md)
- [Deployment](./docs/deployment.md)
- [Roadmap pengembangan](./docs/ROADMAP-PENGEMBANGAN-SKILVORA.md)
- [Release readiness](./docs/RELEASE-READINESS.md)
