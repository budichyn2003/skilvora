# Setup staging Skilvora

Konfigurasi ini menargetkan **Vercel untuk `apps/web`** dan **Render untuk API**. File `render.yaml` membuat blueprint API bernama `skilvora-api-staging`; konfigurasi ini tidak membuat akun, database, domain, atau secret secara otomatis.

## 1. Database PostgreSQL

Siapkan database PostgreSQL staging (misalnya provider yang sudah digunakan project), lalu simpan connection string:

- `DATABASE_URL`: URL koneksi runtime/pooling.
- `DIRECT_URL`: URL koneksi langsung untuk operasi migrasi bila provider membedakan koneksi pooled dan direct.

Jangan gunakan database production untuk staging. Jangan masukkan nilai rahasia ke Git, tiket publik, atau chat.

## 2. Deploy API di Render

1. Hubungkan repository ke Render dan pilih deploy dari `render.yaml`.
2. Isi environment variables bertanda `sync: false` pada dashboard Render:
   - `DATABASE_URL`, `DIRECT_URL`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` (masing-masing random dan berbeda, minimum 32 karakter)
   - `WEB_APP_URL` dan `ALLOWED_ORIGINS` dengan origin Vercel staging yang tepat, tanpa path
   - `API_PUBLIC_URL` dengan URL API Render setelah dibuat
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
   - `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` bila Google OAuth diaktifkan
   - Pertahankan `PAYMENTS_ENABLED=false` untuk prototipe; blueprint memberi nilai aman ini secara default.
3. Blueprint menjalankan install dependency, Prisma Client generation, dan build. Sebelum deploy pertama dengan database kosong, jalankan migrasi menggunakan `pnpm --filter @cahyodev/database db:migrate:deploy` dengan kedua URL database staging tersedia.
4. Pastikan health check `https://<api-render>/health` merespons `{"status":"ok"}`.

### Database yang sudah berisi data sebelum migration baseline

Migration `20261026000000_init` adalah baseline untuk schema lama, bukan migration yang boleh dijalankan ulang pada database yang sudah berisi tabel aplikasi. Untuk database lama yang cocok dengan schema baseline, terlebih dahulu cek duplikasi yang dapat menghalangi unique index pada migration akun/progress/sertifikat:

```sql
SELECT "userId", "classId", COUNT(*)
FROM "Certificate"
GROUP BY "userId", "classId"
HAVING COUNT(*) > 1;

SELECT "quizId", "userId", "attemptNumber", COUNT(*)
FROM "QuizAttempt"
GROUP BY "quizId", "userId", "attemptNumber"
HAVING COUNT(*) > 1;
```

Tinjau dan bersihkan duplikasi secara terkontrol serta buat backup terlebih dahulu. Setelah memastikan skema database lama sama dengan migration baseline, tandai baseline sebagai telah diterapkan satu kali, lalu deploy migration berikutnya:

```powershell
pnpm --filter @cahyodev/database exec prisma migrate resolve --applied 20261026000000_init
pnpm --filter @cahyodev/database db:migrate:deploy
```

Jalankan perintah dengan `DATABASE_URL` dan `DIRECT_URL` menunjuk ke database staging yang tepat. Jangan menandai baseline sebagai applied pada database kosong; database kosong harus menerima migration init melalui `migrate deploy`. Jika riwayat migration atau schema aktual tidak sesuai, hentikan deploy dan selesaikan rekonsiliasi terlebih dahulu—jangan gunakan reset pada database berisi data.

Render tidak menyediakan kredensial SMTP atau OAuth. Buat/konfigurasi layanan tersebut melalui provider pilihan Anda, lalu simpan credential hanya di dashboard Render.

## 3. Deploy web di Vercel

1. Import repository ke Vercel dan tetapkan **Root Directory** ke `apps/web`.
2. Gunakan package manager pnpm/workspace yang dideteksi Vercel. Pastikan install/build berjalan dari monorepo agar dependency `@cahyodev/database` tersedia.
3. Set `NEXT_PUBLIC_API_URL` ke URL publik API staging, misalnya `https://skilvora-api-staging.onrender.com`.
4. Set `NEXT_PUBLIC_SITE_URL` ke domain Vercel staging dan `NEXT_PUBLIC_PAYMENTS_ENABLED=false`; kedua flag pembayaran harus sejalan.
5. Tambahkan domain Vercel staging ke `WEB_APP_URL` dan `ALLOWED_ORIGINS` di Render, kemudian redeploy API.
6. Untuk Google OAuth, tambahkan callback API staging (`/auth/google/callback`) ke daftar redirect URI yang diizinkan provider.

Jangan aktifkan pembayaran nyata: prototipe saat ini tidak mengunggah bukti ke object storage terkelola. Flag API `PAYMENTS_ENABLED` dan flag web `NEXT_PUBLIC_PAYMENTS_ENABLED` harus tetap `false`. Instruksi transfer yang tampil nantinya harus menggunakan detail rekening yang telah disetujui pemilik produk, bukan nilai contoh.

## 4. Checklist verifikasi staging

- API liveness `/health` dan readiness `/health/ready` lulus serta database staging menggunakan schema migration terbaru.
- Register mengirim email verifikasi; link membuka web staging dan akun baru belum dapat login sebelum verifikasi.
- Reset password, login, refresh, dan logout berfungsi pada origin Vercel staging.
- CORS hanya mengizinkan origin web staging yang telah ditetapkan.
- Pembayaran tetap dinonaktifkan sampai storage bukti terkelola, instruksi transfer tervalidasi, dan acceptance test pembayaran disetujui.
- Jangan menaruh credential di `NEXT_PUBLIC_*`; semua secret hanya berada di Render.
- Jalankan smoke test alur enrollment, progress, kuis, sertifikat, verifikasi publik, dan download PDF sebelum membuka beta.

Untuk konfigurasi lokal, salin `.env.example` menjadi file environment lokal yang sesuai. File environment berisi secret dan tidak boleh dikomit.
