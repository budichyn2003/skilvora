# 📋 SOP: Memulai Proyek Baru dari Stack Plus Studio Core Engine

Dokumen ini adalah panduan standar yang dipakai setiap kali ada proyek klien baru masuk. Tujuannya supaya setup selalu konsisten, identitas Git tidak tercampur, dan repo klien tidak pernah "menempel" ke repo Core System.

Repo Core System: `https://github.com/stackplustudio/stackplustudio-core`

---

## TAHAP 1: Setup Repository

Ada dua cara yang sama-sama sah untuk memulai. Pilih salah satu sesuai kondisi.

### Opsi A — "Use this template" (paling cepat & direkomendasikan)

Dipakai jika repo `stackplustudio-core` sudah di-set sebagai **Template repository** di GitHub Settings.

1. Buka repo core di GitHub.
2. Klik tombol hijau **"Use this template"** → **"Create a new repository"**.
3. Beri nama sesuai proyek klien, misal `lms-project`.
4. GitHub otomatis membuat repo baru berisi salinan penuh dari core — history git langsung bersih dari nol.
5. Clone repo **baru** tersebut ke lokal:

```bash
git clone git@github.com-stackplustudio:stackplustudio/lms-project.git
cd lms-project
```

Selesai — tidak perlu langkah tambahan untuk memutus koneksi ke core, karena "Use this template" memang tidak menyertakan histori/remote dari repo asal.

### Opsi B — Clone manual + reset Git (jika clone dari repo biasa)

**Langkah 1: Bikin repo kosong di GitHub**
Buat repository baru (misal `lms-project`), biarkan kosong — jangan centang "Add README".

**Langkah 2: Clone Core System ke komputer, langsung ganti nama folder**

```bash
git clone git@github.com-stackplustudio:stackplustudio/stackplustudio-core.git lms-project
cd lms-project
```

**Langkah 3: Putuskan hubungan dari Core System**

Hapus folder `.git` bawaan dari core, lalu init ulang dari nol:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .git

# macOS/Linux
rm -rf .git
```

```bash
git init
```

**Langkah 4: Sambungkan ke repo baru dan push**

```bash
git add .
git commit -m "chore: initial setup from core system v1.0"
git remote add origin git@github.com-stackplustudio:stackplustudio/lms-project.git
git branch -M main
git push -u origin main
```

### Langkah wajib di kedua opsi: Isolasi identitas Git

Agar riwayat commit di repo klien memakai identitas profesional Stack Plus Studio:

```bash
git config user.name "Stack Plus Studio"
git config user.email "stackplustudio@gmail.com"
```

### Instalasi & Environment

1. Pasang seluruh dependensi:
```bash
pnpm install
```

2. Duplikat template environment:
Salin `.env.example` menjadi `.env` di root repository:
```bash
cp .env.example .env
```
Sesuaikan variabel database, JWT secrets, dan port:
- `DATABASE_URL` / `DIRECT_URL` (PostgreSQL Supabase/Neon/Local)
- `JWT_SECRET` & `JWT_REFRESH_SECRET` (generate random string min 32 karakter)
- `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)

3. Sinkronisasi database dan generate Prisma client:
```bash
pnpm db:generate
pnpm db:push
```

4. Jalankan development server:
```bash
pnpm dev
```

Proyek baru kini sudah punya "rumah" sendiri di GitHub dan siap dikembangkan.

---

## TAHAP 2: Menambahkan Fitur Bisnis (Contoh: LMS)

Fondasi (Autentikasi JWT, Security Headers Helmet, Rate Limiting Throttler, RolesGuard RBAC, Axios Interceptor, Toast, E2E & Unit Test runner) sudah selesai dari Core System. Pekerjaan berikutnya 100% fokus ke fitur bisnis proyek.

### 1. Update skema database (Prisma)

Selalu jadi langkah pertama. Buka `packages/database/prisma/schema.prisma`, tambahkan model baru di bawah model `User` yang sudah ada:

```prisma
model Course {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Int
  modules     Module[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Module {
  id       String @id @default(uuid())
  title    String
  courseId String
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

Lalu sinkronkan ke database dan perbarui tipe Prisma Client:

```bash
pnpm db:push
pnpm db:generate
```

### 2. Tambah modul backend (NestJS)

Jangan buat folder secara manual. Gunakan NestJS CLI supaya DTO, Controller, dan Service langsung terbuat mengikuti standar yang sama seperti modul `users`:

```bash
cd apps/api
npx @nestjs/cli g resource courses
npx @nestjs/cli g resource modules
```

Ini otomatis membuat `apps/api/src/courses` dan `apps/api/src/modules` lengkap dengan blueprint CRUD.
- Tambahkan `@UseGuards(JwtAuthGuard, RolesGuard)` pada controller yang membutuhkan otentikasi.
- Gunakan `@Roles('ADMIN')` atau role lain untuk membatasi hak akses.
- Gunakan DTO dengan class-validator (`@IsString()`, `@MinLength()`, dsb) untuk validasi request payload.

### 3. Tambah halaman frontend (Next.js Route Groups)

Buat folder baru di dalam `apps/web/src/app/(dashboard)/` atau `apps/web/src/app/dashboard/` sesuai role yang dibutuhkan proyek. Contoh untuk LMS:

```text
apps/web/src/app/
├── (dashboard)/
│   ├── instructor/           # Halaman khusus instruktur
│   │   ├── layout.tsx        # Sidebar khusus instruktur
│   │   ├── courses/          # Halaman CRUD materi kelas
│   │   └── page.tsx
│   │
│   └── student/              # Halaman khusus siswa
│       ├── layout.tsx        # Sidebar khusus siswa
│       ├── my-learning/      # Halaman belajar
│       └── page.tsx
```

Gunakan `import { api } from "@/lib/axios"` untuk semua API call (sudah otomatis menyisipkan JWT Bearer dari cookie) dan `import toast from "react-hot-toast"` untuk feedback user.

---

## TAHAP 3: Quality Check Sebelum Delivery

Sebelum push atau membuat Pull Request, jalankan quality gates monorepo:

```bash
# 1. Validasi tipe TypeScript
pnpm typecheck

# 2. Linting kode (harus 0 error)
pnpm lint

# 3. Unit test dan verifikasi coverage (threshold 70%)
pnpm test:cov

# 4. Validasi production build
pnpm build
```

---

## Ringkasan Alur

Core System ibarat tanah yang sudah ada fondasi cor-coran, pagar, dan satpamnya. Setiap proyek baru tinggal:

1. **"Beli tanah baru"** dengan desain yang sama → Tahap 1 (setup Git & repo template).
2. **"Bikin denah ruangan baru"** → Edit `packages/database/prisma/schema.prisma` lalu `pnpm db:push`.
3. **"Bangun tembok ruangan"** → `npx @nestjs/cli g resource` di `apps/api`.
4. **"Cat dan hias ruangannya"** → Slicing UI di Next.js App Router dengan panduan [`docs/ui.md`](./ui.md).
5. **"Inspeksi kualitas"** → Jalankan `pnpm typecheck`, `pnpm lint`, dan `pnpm test:cov`.

---

## ✅ Checklist Cepat Setiap Proyek Baru

- [ ] Buat repo baru di GitHub (via template atau kosong)
- [ ] Clone / setup lokal, pastikan `.git` sudah terhubung ke repo klien baru (bukan core)
- [ ] Set identitas Git Stack Plus Studio (`stackplustudio@gmail.com`)
- [ ] `pnpm install` + konfigurasi `.env` dari `.env.example`
- [ ] `pnpm db:generate` dan `pnpm db:push`
- [ ] Tambah model Prisma di `packages/database/prisma/schema.prisma`
- [ ] Generate modul backend dengan `npx @nestjs/cli g resource` di `apps/api`
- [ ] Proteksi endpoint dengan `@UseGuards(JwtAuthGuard, RolesGuard)`
- [ ] Buat UI frontend menggunakan token di [`docs/ui.md`](./ui.md)
- [ ] Jalankan `pnpm typecheck`, `pnpm lint`, dan `pnpm test:cov` (semua hijau)
- [ ] Push ke repo proyek klien
