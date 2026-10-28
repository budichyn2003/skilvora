# 🤝 Handover Prompt & Development Protocol

Dokumen ini adalah protokol serah-terima pengerjaan proyek (handover) bagi AI Developer maupun Engineer yang akan melanjutkan pengembangan di atas Stack Plus Studio Core Engine.

---

## STEP 1 — Understand PRD.md

1. Baca dan pahami `PRD.md` (Project Requirement Document) proyek klien secara menyeluruh.
2. **Jangan langsung melakukan coding.**
3. Setelah memahami PRD, buat *breakdown* project secara terstruktur dari awal sampai selesai, meliputi:
   * **Phase**: Pembagian fase pengerjaan (Fondasi, Core Feature, Integrasi, Finishing).
   * **Stage & Step**: Urutan pengerjaan modular per fitur.
   * **Feature & Requirement**: Spesifikasi fungsional dan non-fungsional.
   * **Dependency**: Keterkaitan antar entitas/modul.
   * **Validation**: Kriteria pengujian keberhasilan pada setiap tahap.
4. Pastikan seluruh *breakdown* benar-benar berdasarkan isi `PRD.md` dan **jangan menambahkan requirement yang tidak ada**.
5. Berikan hasil breakdown secara lengkap agar dapat digunakan sebagai roadmap development yang disepakati.

> **Tujuan:** PRD menjadi dasar mutlak untuk menentukan *apa* yang harus dibangun sebelum masuk ke tahap UI dan implementasi teknis.

---

## STEP 2 — Understand docs/ui.md

1. Baca dan pahami [`docs/ui.md`](./ui.md) secara menyeluruh.
2. **Jangan melakukan coding sebelum memahami design tokens.**
3. Pahami seluruh guideline UI/UX yang tersedia:
   * **Color Tokens**: `primary` (`#0053F1`), `background` (`#FCFBF6`), `surface`, `ink`, dsb.
   * **Typography**: Inter dari `next/font/google`, tracking rapat, hierarchy heading.
   * **Components**: Button pill, input styling, card hover.
   * **Layout**: Whitespace lega, mobile-first, tanpa horizontal overflow.
4. Identifikasi kebutuhan UI yang diperlukan untuk project: Page, Layout, Component, Navigation, Form, Interaction, dan State UI.
5. **Dilarang keras** membuat design system, warna hex acak, font baru, atau animasi custom yang bertentangan dengan `docs/ui.md`.

> **Tujuan:** `docs/ui.md` menjadi acuan utama agar seluruh frontend yang dibuat konsisten dengan visual identity Stack Plus Studio.

---

## STEP 3 — Understand Architecture & README.md

1. Baca dan pahami [`docs/architecture.md`](./architecture.md) dan [`README.md`](../README.md) secara menyeluruh.
2. Pahami arsitektur teknis yang sudah terkonfigurasi:
   * **Workspace**: Turborepo + pnpm workspace (`apps/web`, `apps/api`, `packages/database`).
   * **Backend**: NestJS, DTO Validation, JwtAuthGuard, RolesGuard, Rate Limiting (Throttler), Helmet.
   * **Database**: Prisma ORM, PostgreSQL connection management.
   * **Frontend**: Next.js 16 (App Router), Axios instance (`@/lib/axios`), React Hot Toast.
   * **Testing & Quality Gates**: Unit tests (70%+ coverage), API E2E, Playwright smoke tests, k6 load testing, CI/CD GitHub Actions.
3. **Jangan mengubah atau mengganti arsitektur, tech stack, atau konfigurasi dasar** tanpa konfirmasi eksplisit dari tech lead / owner.

> **Tujuan:** Menjaga keutuhan arsitektur inti agar proyek tetap stabil, aman, dan mudah di-maintain.

---

## 📌 Standard Rules of Engagement

* **Selalu berpatokan pada segitiga panduan:** `PRD.md` (Scope), `docs/ui.md` (Design), dan `README.md` / `docs/architecture.md` (Tech).
* **Jawaban tepat tanpa asumsi tak berdasar:** Jika ada kebutuhan bisnis atau access policy yang ambigu, tanyakan konfirmasi terlebih dahulu.
* **Integritas kode yang sudah ada:** Jika ingin memodifikasi file yang sudah ada, selalu periksa kode aktualnya terlebih dahulu. Jangan menimpa logika atau validasi yang sudah teruji.
* **Alur pembuatan modul baru:** Selalu ikuti SOP di [`docs/newproject.md`](./newproject.md):
  - Skema database di `packages/database/prisma/schema.prisma`
  - Generate modul backend via `npx @nestjs/cli g resource <name>`
  - Route groups frontend di `apps/web/src/app/(dashboard)/`
* **Quality gate:** Pastikan `pnpm typecheck`, `pnpm lint`, dan `pnpm test:cov` selalu hijau sebelum menyelesaikan pekerjaan.
