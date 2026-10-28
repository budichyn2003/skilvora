# Testing Runbook — Maincore

Runbook praktis untuk menjalankan seluruh lapisan pengujian di monorepo
Maincore (Next.js + NestJS + Prisma/Turborepo/pnpm). Semua perintah dijalankan
dari root repo kecuali disebutkan lain.

## 0. Prasyarat

| Alat           | Kebutuhan                                                     |
| -------------- | ------------------------------------------------------------- |
| Node.js        | v20+                                                          |
| pnpm           | v9 (`corepack enable` atau `npm i -g pnpm@9`)                 |
| Docker Desktop | **wajib** untuk integration test (Postgres lokal container)   |
| k6             | hanya jika menjalankan performance test (`winget install k6.k6`) |

Install dependency dulu:

```powershell
pnpm install
```

## 1. Unit & Regression Test (NestJS)

Tanpa database — pure logic, guard, decorator, DTO.

```powershell
pnpm --filter api test          # satu paket semua unit test
pnpm test:cov                    # + coverage report (turbo: semua workspace)
pnpm --filter api test:cov
```

Coverage threshold saat ini: **70%** untuk satements/branches/functions/lines
(naik ke 80% setelah audit). Report HTML di `apps/api/coverage/lcov-report/index.html`.

## 2. Integration & API Security Test (butuh Postgres lokal)

Integration test menyentuh database, jadi **wajib** pakai database lokal.

1. Pastikan Docker Desktop jalan.
2. Jalankan container test DB:

```powershell
docker run --rm -d --name maincore-test-db -p 5433:5432 `
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=maincore_test postgres:16
```

3. Sync schema khusus test DB (port `5433`, beda dari port dev `5432`):

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5433/maincore_test"
pnpm --filter @cahyodev/database exec prisma db push
```

4. Jalankan e2e/integration:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5433/maincore_test"
pnpm test:e2e
```

5. Matikan container setelah selesai:

```powershell
docker stop maincore-test-db
```

### Test Safety Guard (otomatis)

`apps/api/test/test-safety.guard.ts` **memblokir test run** kalau
`DATABASE_URL` mengarah ke remote host (`supabase.co`, `neon.tech`,
`rds.amazonaws.com`, dsb). Guard ini memastikan test tidak pernah menyentuh
database Supabase/produksi. Kalau guard berbunyi, URL kamu salah — perbaiki,
jangan di-bypass.

## 3. E2E Test (Playwright — Next.js)

Butuh frontend dev server + (untuk flow dashboard) backend dev server.

```powershell
pnpm --filter web test:e2e
```

Playwright config: `apps/web/playwright.config.ts`, test files:
`apps/web/e2e/*.spec.ts`. Hasil report di `apps/web/playwright-report/`.

## 4. Performance Test (k6)

Ringkasan — panduan lengkap: [`perf/k6/README.md`](../perf/k6/README.md) dan
[`docs/perf-testing.md`](./perf-testing.md).

```powershell
pnpm perf:smoke    # 10 request, sanity check cepat
pnpm perf:load     # 20 VU selama ~2 menit
```

Butuh k6 binary terpasang; target default `http://localhost:3001`.

## 5. Validate Semua Sekaligus (lokal, rekayasa CI)

```powershell
pnpm typecheck
pnpm lint
pnpm test:cov
pnpm test:e2e
pnpm build
```

Ini mirror yang dijalankan `ci.yml` pada setiap push/PR ke `main`.
