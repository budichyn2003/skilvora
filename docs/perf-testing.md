# Performance Testing — Maincore

Dokumen metodologi pengujian performa. Untuk sintaks & parameter detail,
lihat [`perf/k6/README.md`](../perf/k6/README.md).

## 1. Stack yang dipilih

- **k6** (Grafana) — kode test `perf/k6/*.js`, dikonfigurasi lewat env var,
  sudah tersedia 5 skenario (smoke, load, stress, spike, soak).
- Web Dashboard real-time: `k6 web dashboard` tersedia jika k6 versi
  `>= 0.49`; akses di `http://localhost:5665`. (opsional)

**Prasyarat:** k6 binary terpasang (`winget install k6.k6` / `brew install k6`).
k6 **tidak** ditambahkan ke `package.json` karena bukan dependency Node.

## 2. Skenario

| Skenario  | Kapan dipakai                                  | Env vars utama              |
| --------- | ---------------------------------------------- | --------------------------- |
| `smoke`   | sanity check cepat; ran 1x tiap deploy          | *(default)*                 |
| `load`    | lalu lintas normal harian                       | `K6_VUS`, `K6_DURATION`     |
| `stress`  | dicari titik saturation (kalau dipanggil)       | `K6_MAX_VUS`                |
| `spike`   | burst mendadak (push notification, traffic)     | `K6_SPIKE_VUS`              |
| `soak`    | lek memori, connection pool, drift performance  | `K6_RATE`, `K6_SOAK_DURATION` |

## 3. Target & batasan safety

Semua skenario agresif (stress, spike, soak) memakai `lib/safety.js` yang
menolak jalannya kalau `BASE_URL` mengarah ke host produksi/remote
(vercel.app, amazonaws.com, supabase.co, dll). Hanya local dev atau
staging khusus yang diizinkan.

Target dev lokal:

```powershell
pnpm --filter api start:dev
# backend di http://localhost:3001
pnpm perf:smoke
```

## 4. Metrik yang diukur

| Metrik                    | Arti                                                  |
| ------------------------- | ----------------------------------------------------- |
| `http_reqs`               | throughput (request/detik)                            |
| `http_req_failed`         | error rate (budget 0–10% tergantung skenario)         |
| `http_req_duration p(95)` | 95% request selesai di bawah nilai ini                |
| `http_req_duration p(99)` | distribusi tail (user pengalaman terburuk)            |
| `iterations`              | jumlah iterasi user-flow selesai (users list/profile) |

## 5. Interpretasi & baseline

Ambil baseline **di mesin & database yang sama** sebagai pembanding:

```powershell
pnpm perf:smoke 2>&1 | Select-String "http_req_duration"
pnpm perf:load  2>&1 | Select-String "http_req_duration"
```

Contoh mencatat hasil sebagai tabel markdown di PR / `docs/perf-testing.md`
(jangan disimpan sebagai hasil produksi — selalu kualifikasi dengan
spesifikasi mesin):

| Skenario | p(95)    | p(99)     | error rate | Runtime        | Mesin          |
| -------- | -------- | --------- | ---------- | -------------- | -------------- |
| load     | 271ms    | 485ms     | 0.02%      | 2026-10-22     | local Docker, Apple M1 |

## 6. Regresi performa (CI gate)

k6 exit non-zero kalau threshold dilanggar. Belum ada job `perf` di CI
karena hasil dinyatakan flaky oleh rekayasa; kalau baseline sudah stabil
dan mau jadi gate, buat workflow `perf-regression.yml` di-trigger manual
(`workflow_dispatch`) atau `schedule` mingguan, **jangan** di PR biasa.

## 7. Menambah skenario baru

1. Copy satu file di `perf/k6/scenarios/` ke nama baru.
2. Sesuaikan threshold & stages/scenarios-nya.
3. Kalau skenario agresif, tambahkan `setup()` memanggil `assertLocalTarget`.
4. Update tabel skenario di `perf/k6/README.md` dan `docs/perf-testing.md`.
