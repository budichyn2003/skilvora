# CI/CD Quality Gates — Maincore

Dua workflow GitHub Actions menjaga kualitas & keamanan Maincore.

## 1. `ci.yml` — Quality Gate (lint, test, build)

Dipicu setiap `push` & `pull_request` ke `main`.

Versi pnpm dipatok di `package.json` melalui `packageManager` (`pnpm@9.0.0`).
Karena itu, `pnpm/action-setup` di workflow tidak menetapkan `version` lagi
agar tidak terjadi konflik versi.

Job `quality-gate` (urutan fail-fast):

1. `pnpm install --frozen-lockfile` — lockfile harus konsisten.
2. `pnpm db:generate` — Prisma Client generate bersih.
3. `pnpm typecheck` — TypeScript di semua workspace.
4. `pnpm lint` — ESLint di semua workspace.
5. `pnpm test:cov` — unit + regression test + coverage ≥ threshold.
6. `pnpm test:e2e` — integration test NestJS + Api security suite
   (tak didukung DB Supabase lokal; pakai guard yang sama dengan lokal).
7. `pnpm build` — production build NestJS & Next.js.

Job `docker-validate`: build image `apps/api/Dockerfile` (tanpa push)
untuk mengorek error Docker/regression runtime lebih awal.

## 2. `security.yml` — Security Scan (mingguan + tiap PR ke main)

| Job                  | Alat              | Yang diperiksa                                        |
| -------------------- | ----------------- | ----------------------------------------------------- |
| `secret-scan`        | Gitleaks          | Kebocoran kredensial (API key, password, token)       |
| `dependency-audit`   | `pnpm audit`      | CVE dependency prod (level `high` & di atasnya)       |
| `dependency-scan`    | Trivy (fs scan)   | Vulnerability + secret + config mistake semua paket    |
| `container-scan`     | Trivy (image scan)| Vulnerability di image Docker `apps/api/Dockerfile`   |

Laporan scan muncul di tab **Security → Code scanning** GitHub.

## Menjalankan gates yang sama secara lokal

```powershell
pnpm lint; pnpm typecheck; pnpm test:cov; pnpm test:e2e; pnpm build
```

(Gate `secret-scan` & `dependency-audit` otomatis jalan di GitHub Actions;
belum ada runner lokal — lihat `docs/security-scanning.md` bila dibutuhkan.)

## Gagal gate: apa artinya, apa yang dilakukan

| Gate gagal         | Penyebab umum                              | Aksi                                                  |
| ------------------ | ------------------------------------------ | ----------------------------------------------------- |
| `pnpm install`     | `pnpm-lock.yaml` tidak sinkron             | `pnpm install` lokal, commit lockfile yang diupdate    |
| `typecheck`        | type error baru                            | perbaiki dari output TS, jangan `as any` sembarangan   |
| `lint`             | aturan format/eslint                       | `pnpm --filter api format` atau perbaiki manual        |
| `test:cov`         | unit test gagal / coverage < threshold     | lihat output, tambah test sebelum naikkan threshold    |
| `test:e2e`         | guard `[TestSafetyGuard]` / DB tidak jalan | cek `docs/testing-runbook.md` bagian integration       |
| `docker-validate`  | Dockerfile rusak                           | test `docker build -f apps/api/Dockerfile .` lokal     |
| `secret-scan`      | kredensial nyasar ke repo                  | **segera rotasi** kredensial, lalu bersihkan history   |

## Rules untuk menambah gate baru

- Gate wajib: harus punya alasan jelas + cara memperbaikinya, dokumentasikan
  di file ini.
- Gate opsional (misal `soak`/`stress`-scale perf test) jangan dibuat
  blocking PR — pisahkan ke job `schedule` atau workflow yang di-trigger
  manual, supaya developer tidak terganggu.
