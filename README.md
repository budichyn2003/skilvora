# CayLabs - Core Engine 

**CayLabs (Cahyo Lab)** adalah *personal engineering laboratory* milik **Budi Cahyono**, yang digunakan sebagai fondasi utama untuk membangun dan mengembangkan berbagai proyek software.

Core Engine ini dibuat untuk menghindari setup proyek berulang. Setiap proyek baru dapat dimulai dari fondasi yang sudah memiliki struktur, dependency, konfigurasi, authentication, database integration, dan development workflow yang terstandarisasi.

> **Clone → Configure → Build**

---

## Tech Stack

### Architecture & Tooling

- **Monorepo:** Turborepo
- **Package Manager:** pnpm

### Frontend — `apps/web`

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (Custom Solid Enterprise Theme with CayLabs Tokens)
- **State & HTTP:** React Hooks, Axios
- **Feedback UI:** React Hot Toast

### Backend — `apps/api`

- **Framework:** NestJS
- **ORM:** Prisma
- **Authentication:** JWT + Passport
- **Password Security:** bcryptjs
- **Infrastructure:** Docker

### Database

- **Database:** PostgreSQL
- **ORM:** Prisma
- **Provider:** Compatible with PostgreSQL providers such as Neon

---

## Struktur Direktori

```text
.
├── apps
│   ├── api                # Backend NestJS
│   │   ├── prisma         # Skema database
│   │   ├── src
│   │   │   ├── auth       # Modul JWT & Middleware Guard
│   │   │   ├── users      # Blueprint CRUD Modul (Standar)
│   │   │   └── main.ts    # Entry point backend (Port 3001)
│   │   └── Dockerfile     # Setup kontainer deployment
│   │
│   └── web                # Frontend Next.js
│       ├── src
│       │   ├── app        # App Router (Pages, Dashboard)
│       │   ├── components # Komponen UI re-usable
│       │   └── lib        # Konfigurasi eksternal (Axios)
│       └── proxy.ts       # Middleware proteksi rute Next.js
│
├── packages               # Shared config (TS, ESLint, dll)
├── pnpm-workspace.yaml    # Definisi workspace pnpm
└── turbo.json             # Konfigurasi pipeline Turborepo
---

## Core Philosophy

CayLabs Core Engine menggunakan prinsip:

```text
Standardized Foundation
        ↓
Reusable Architecture
        ↓
Clone for New Project
        ↓
Configure Environment
        ↓
Build & Customize
```

Tujuannya adalah menjaga konsistensi antar proyek sekaligus mengurangi waktu yang diperlukan untuk melakukan setup dari awal.

Setiap proyek tetap dapat dikembangkan dan disesuaikan sesuai kebutuhan tanpa harus mengubah fondasi utama secara keseluruhan.

---

## Getting Started

### 1. Clone Repository

Clone repository ini sebagai fondasi proyek baru.

```bash
git clone <repository-url>
cd <project-name>
```

### 2. Install Dependencies

Pastikan **Node.js** dan **pnpm** sudah tersedia.

```bash
pnpm install
```

### 3. Configure Environment

Buat environment variables sesuai kebutuhan project.

#### Backend — `apps/api/.env`

```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-secure-secret"
```

#### Frontend — `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

> Jangan commit file `.env` atau `.env.local` ke repository public.

### 4. Setup Prisma

```bash
pnpm --filter ./apps/api prisma generate
pnpm --filter ./apps/api prisma db push
```

### 5. Run Development

Jalankan seluruh workspace dari root:

```bash
pnpm dev
```

Default development server:

```text
Frontend → http://localhost:3000
Backend  → http://localhost:3001
```

---

## Authentication

Core Engine menyediakan authentication flow berbasis JWT.

```text
User
 ↓
Next.js
 ↓
NestJS API
 ↓
Credential Validation
 ↓
JWT
 ↓
Cookie
 ↓
Axios Authorization
 ↓
Protected API
```

Frontend menggunakan `proxy.ts` untuk membantu melindungi route yang membutuhkan authentication, sementara backend tetap melakukan validasi authorization pada endpoint yang dilindungi.

---

## Development Workflow

Workflow utama CayLabs:

```text
Define Feature
      ↓
Update Database
      ↓
Update Backend
      ↓
Update Frontend
      ↓
Test
      ↓
Commit
```

Bagian database dapat dilewati apabila feature tidak membutuhkan perubahan schema.

---

## Deployment

### Frontend

Frontend Next.js dapat di-deploy menggunakan platform seperti **Vercel**.

Root directory:

```text
apps/web
```

Environment variables untuk deployment staging Skilvora:

```env
NEXT_PUBLIC_API_URL="https://skilvora-jvx9.onrender.com"
NEXT_PUBLIC_SITE_URL="https://skilvora-omega.vercel.app"
```

Set variabel tersebut pada environment Vercel yang dipakai deployment staging, lalu redeploy agar nilainya tersedia saat build Next.js. Jangan gunakan URL API staging untuk deployment production.

### Backend

Backend NestJS tersedia dengan Dockerfile:

```text
apps/api/Dockerfile
```

Contoh build:

```bash
docker build -t caylabs-api -f apps/api/Dockerfile .
```

Backend dapat dijalankan pada VPS atau container infrastructure lainnya.

---

## Engineering Principles

CayLabs Core Engine dibangun berdasarkan beberapa prinsip:

* **Reusable Foundation**
* **Monorepo Architecture**
* **Separation of Concerns**
* **Centralized Database Layer**
* **API-based Communication**
* **Secure Environment Configuration**
* **Modular Backend**
* **Reusable UI Components**
* **Container-ready Backend**
* **Production-ready Frontend**

---

## Purpose

CayLabs bukan sekadar boilerplate.

Core Engine ini berfungsi sebagai **laboratorium engineering** untuk mengembangkan, menguji, menyempurnakan, dan menggunakan kembali fondasi teknologi dalam berbagai proyek.

```text
                    CayLabs
                 Cahyo Laboratory
                       │
                       ▼
                  Core Engine
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Frontend     Backend      Database
       Next.js      NestJS       PostgreSQL
          │            │            │
          └────────────┼────────────┘
                       ▼
                 New Projects
```

---

## Credits

Developed by **Budi Cahyono**
**CayLabs — Cahyo Lab**
