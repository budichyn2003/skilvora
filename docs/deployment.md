# Panduan Deployment Stack Plus Core

Dokumen ini menjelaskan deployment monorepo dengan pilihan utama **Vercel (web) + Railway (API) + Neon (PostgreSQL)**, diikuti lima alternatif untuk setiap lapisan. Nama menu provider bisa berubah; selalu cek dokumentasi resminya dan biaya/limit terbaru sebelum migrasi.

## 1. Peta layanan

| Lapisan | Pilihan utama | Direktori / kebutuhan |
|---|---|---|
| Frontend | Vercel | `apps/web`, Next.js 16 |
| Backend | Railway | `apps/api`, NestJS, port dari `PORT` |
| Database | Neon | PostgreSQL; URL runtime pooled dan URL migrasi direct |

Alternatif di bawah adalah **lima pilihan per lapisan**, bukan lima layanan wajib dipakai bersamaan. Migrasi database merupakan pekerjaan terpisah: siapkan database PostgreSQL baru, pindahkan data, deploy API, lalu alihkan URL frontend/API dengan urutan yang terkontrol.

## 2. Sebelum deploy

1. Push branch yang sudah lolos pemeriksaan ke GitHub.
2. Pastikan `.env` lokal, file dump database, dan secret tidak masuk Git.
3. Siapkan database PostgreSQL production dan simpan kedua URL:
   - `DATABASE_URL`: pooled connection untuk koneksi aplikasi.
   - `DIRECT_URL`: koneksi langsung untuk Prisma Migrate.
4. Buat `JWT_SECRET` dan `JWT_REFRESH_SECRET` yang kuat dan berbeda. Contoh generator lokal: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
5. Terapkan migrasi production dengan `pnpm --filter @cahyodev/database exec prisma migrate deploy` setelah migration files tersedia dan sudah direview. Jangan menjalankan `prisma db push` sebagai mekanisme schema deployment production.
6. Pastikan semua origin dan URL memakai HTTPS di production, lalu catat siapa yang berwenang mengakses secret dan backup.

## 3. Jalur utama: Vercel + Railway + Neon

### A. Neon — database

1. Buat project PostgreSQL di Neon dan pilih region sedekat mungkin dengan API Railway.
2. Salin pooled connection string untuk `DATABASE_URL` dan direct connection string untuk `DIRECT_URL`.
3. Simpan kedua nilai di secret environment Railway. Jangan menaruhnya pada `NEXT_PUBLIC_*` atau di repository.
4. Dari lingkungan rilis yang aman, jalankan `pnpm --filter @cahyodev/database exec prisma migrate deploy`.
5. Verifikasi endpoint API `/health`, lalu jalankan smoke test read/write non-destruktif pada data uji.
6. Atur backup sesuai retention plan akun dan lakukan uji restore secara berkala.

Dokumentasi: [Neon — Connect from any app](https://neon.tech/docs/connect/connect-from-any-app), [Neon — Backups](https://neon.tech/docs/manage/backups).

### B. Railway — backend

1. Buat service dari repository GitHub.
2. Pertahankan root repository sebagai build context workspace; atur Dockerfile path ke `apps/api/Dockerfile` bila memakai Dockerfile.
3. Pastikan service menjalankan API pada `process.env.PORT`; aplikasi saat ini memakai port 3001 sebagai fallback lokal.
4. Tambahkan variables berikut ke service:
   - `DATABASE_URL` dan `DIRECT_URL` dari Neon.
   - `JWT_SECRET` dan `JWT_REFRESH_SECRET` (secret berbeda).
   - `JWT_EXPIRES_IN` dan `JWT_REFRESH_EXPIRES_IN` sesuai kebijakan.
   - `FRONTEND_URL` dengan origin Vercel yang tepat, tanpa trailing slash.
   - `NODE_ENV=production`.
5. Deploy dan cek `/health` pada URL publik Railway. Periksa logs bila health check atau startup gagal.
6. Setelah domain frontend final, perbarui `FRONTEND_URL`, redeploy, lalu uji preflight/CORS dan alur auth dari browser.

Dokumentasi: [Railway — Deployments](https://docs.railway.com/guides/deployments), [Railway — Variables](https://docs.railway.com/guides/variables).

### Deploy API ke Render dengan Docker

Dockerfile API berada di `apps/api/Dockerfile`, tetapi memakai dependency dan package
database dari workspace monorepo. Karena itu build context harus root repository:

- **Root Directory / Docker Context Directory:** `.` (root repository; jangan `apps` atau `apps/api`).
- **Dockerfile Path:** `apps/api/Dockerfile`.
- Jangan set Dockerfile path sebagai build context. Path Dockerfile dan build context adalah dua pengaturan berbeda.
- Jika menggunakan Blueprint `render.yaml`, ikuti runtime `node` dan `buildCommand` yang didefinisikan di file itu; jangan mengganti service menjadi Docker kecuali memang mengatur path/context Docker di atas.

Jika Docker build gagal dengan `COPY ... not found` untuk `apps/api`, `packages`,
atau `pnpm-workspace.yaml`, hampir selalu Root Directory/build context tidak
mencakup root repository. Periksa ulang pengaturan tersebut, simpan, lalu jalankan
deploy ulang. Dockerfile menggunakan Corepack agar versi pnpm mengikuti
`packageManager` di `package.json`.

### C. Vercel — frontend

1. Import repository di Vercel dan pilih root directory `apps/web`. Pastikan integrasi monorepo mengenali `pnpm-lock.yaml` dan workspace root.
2. Gunakan framework preset Next.js dan build script package `web` (`pnpm build` dari app root).
3. Tambahkan `NEXT_PUBLIC_API_URL` berisi URL API Railway production (tanpa route `/health`).
4. Tambahkan nilai environment ke Production, Preview, dan Development sesuai kebutuhan. Nilai `NEXT_PUBLIC_*` masuk ke bundle browser; jangan pernah memasukkan secret di sana.
5. Deploy, buka homepage `/`, lalu uji satu halaman publik dan request API yang relevan.
6. Tambahkan origin domain Vercel production ke `FRONTEND_URL` Railway dan redeploy backend.

Dokumentasi: [Vercel — Deploying a project](https://vercel.com/docs/deployments), [Vercel — Environment variables](https://vercel.com/docs/projects/environment-variables).

### D. Urutan verifikasi release

1. Pastikan migration berhasil dan `/health` API memberi respons sehat.
2. Pastikan homepage Vercel dapat dibuka tanpa login.
3. Pastikan `/dashboard` tetap dialihkan ke homepage bila cookie `token` tidak ada.
4. Pastikan frontend mengirim request ke API production, CORS mengizinkan origin frontend, dan autentikasi/authorization tetap diuji di API.
5. Pantau log frontend, API, database, error rate, dan penggunaan kuota/biaya setelah rilis.

## 4. Lima alternatif frontend selain Vercel

Untuk setiap alternatif, sambungkan repository yang sama, pilih `apps/web` sebagai app root bila platform mendukung monorepo, set `NEXT_PUBLIC_API_URL`, deploy, kemudian verifikasi `/` dan request API.

1. **Netlify** — cocok untuk aplikasi Next.js dengan adapter resmi Netlify.
   - Buat site dari Git provider dan pilih base directory `apps/web`.
   - Set build command `pnpm build`; biarkan plugin/runtime Next.js menangani output.
   - Isi `NEXT_PUBLIC_API_URL`, deploy branch preview, verifikasi routing dan image/font optimization yang dipakai.
   - Dokumen: [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/overview/).
2. **Cloudflare Workers + OpenNext** — jalur Next.js di Cloudflare; bukan static Pages deployment biasa.
   - Ikuti adapter OpenNext untuk versi Next.js yang dipakai dan lakukan compatibility check sebelum pindah.
   - Atur workspace/build sesuai panduan adapter dan konfigurasi binding/environment Cloudflare.
   - Set `NEXT_PUBLIC_API_URL`, deploy ke preview Worker, lalu uji SSR, route handlers, dan aset.
   - Dokumen: [OpenNext for Cloudflare](https://opennext.js.org/cloudflare).
3. **Render Web Service** — deploy web Node service dari monorepo.
   - Buat Web Service dari repo, atur root/build context sesuai workspace `apps/web`.
   - Build `pnpm install --frozen-lockfile && pnpm --filter web build`; start dengan `pnpm --filter web start`.
   - Set `PORT` dari platform bila diperlukan serta `NEXT_PUBLIC_API_URL`, deploy, dan uji SSR.
   - Dokumen: [Render — Next.js](https://render.com/docs/deploy-nextjs-app).
4. **AWS Amplify Hosting** — opsi managed hosting terintegrasi AWS untuk Next.js.
   - Hubungkan repository, pilih app root `apps/web`, dan review build settings monorepo yang dihasilkan.
   - Set `NEXT_PUBLIC_API_URL` pada environment branch yang akan dirilis.
   - Deploy preview, cek build logs serta perilaku SSR/routing, lalu kaitkan domain.
   - Dokumen: [AWS Amplify — Next.js](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html).
5. **Firebase App Hosting** — alternatif managed hosting untuk framework full-stack seperti Next.js.
   - Buat backend App Hosting dari repository/branch dan pilih root aplikasi web sesuai monorepo.
   - Set environment frontend, deploy ke channel preview, lalu validasi runtime Next.js yang digunakan.
   - Uji domain, server rendering, dan panggilan API ke backend terpisah.
   - Dokumen: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

## 5. Lima alternatif backend selain Railway

Semua pilihan di bawah menjalankan Node/NestJS. Gunakan health check `GET /health`, injeksikan secret sebagai environment variables, dan set `FRONTEND_URL` ke domain frontend aktif.

1. **Render Web Service** — container atau Node service.
   - Buat service dengan root/build context repository; untuk Docker gunakan `apps/api/Dockerfile`.
   - Set `DATABASE_URL`, `DIRECT_URL`, kedua JWT secret, expiry, `FRONTEND_URL`, dan `NODE_ENV`.
   - Pastikan port mengikuti `PORT`, health check path `/health`, lalu deploy dan cek logs.
   - Dokumen: [Render — Docker](https://render.com/docs/docker).
2. **Fly.io** — jalankan image/container dekat region database.
   - Siapkan konfigurasi Fly app dan Docker build context di root monorepo dengan Dockerfile API.
   - Atur internal port sesuai `PORT`, health check `/health`, dan secrets via `fly secrets`.
   - Deploy ke staging, verifikasi health check, kemudian scale/attach domain sesuai kebutuhan.
   - Dokumen: [Fly.io — Launch](https://fly.io/docs/launch/), [Fly.io — Secrets](https://fly.io/docs/apps/secrets/).
3. **Northflank** — service berbasis Git atau container.
   - Buat project/service dan sambungkan repo; tetapkan Dockerfile `apps/api/Dockerfile` dengan workspace root sebagai context.
   - Konfigurasi secrets, port service, health check `/health`, dan domain.
   - Deploy preview/staging, validasi database serta CORS, lalu promosikan release.
   - Dokumen: [Northflank — Deploy services](https://northflank.com/docs/v1/application/deploy).
4. **DigitalOcean App Platform** — deploy container dari repository.
   - Buat app dari GitHub, definisikan service API dan Dockerfile path di `apps/api`.
   - Set run-time variables/secrets, HTTP port, dan health check `/health`.
   - Deploy, verifikasi logs dan endpoint publik, lalu kaitkan domain.
   - Dokumen: [DigitalOcean — App Platform](https://docs.digitalocean.com/products/app-platform/).
5. **Google Cloud Run** — serverless container runtime.
   - Build image dengan root monorepo sebagai context dan `apps/api/Dockerfile` sebagai Dockerfile; push ke Artifact Registry.
   - Buat Cloud Run service, allow public invocation hanya bila API memang publik, atur container port dan secrets.
   - Set `DATABASE_URL`, `DIRECT_URL`, JWT secrets, `FRONTEND_URL`, lalu deploy revision dan uji `/health`.
   - Dokumen: [Google Cloud Run — Deploy a container](https://cloud.google.com/run/docs/deploying).

## 6. Lima alternatif PostgreSQL selain Neon

Sebelum pindah, cek dukungan PostgreSQL, TLS, pooling, batas koneksi, ekstensi yang dibutuhkan, region, backup, dan harga. Isi `DATABASE_URL` dengan URL pooled bila runtime memakai pooler dan `DIRECT_URL` dengan koneksi direct untuk migration. Uji dengan versi Prisma repository sebelum cutover.

1. **Supabase Database**
   - Buat project dan pilih region dekat backend.
   - Ambil connection string pooler untuk runtime serta direct connection untuk `DIRECT_URL`.
   - Set secrets, jalankan Prisma migration, verifikasi koneksi dan lakukan uji restore.
   - Dokumen: [Supabase — Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres).
2. **Railway PostgreSQL**
   - Buat PostgreSQL service dan pastikan API service mendapat hostname/connection string internal yang privat.
   - Gunakan internal pooled/runtime URL jika tersedia, serta direct connection untuk `DIRECT_URL`.
   - Jalankan migration dan uji API dalam environment yang sama sebelum mengalihkan produksi.
   - Dokumen: [Railway — PostgreSQL](https://docs.railway.com/guides/postgresql).
3. **Render Postgres**
   - Buat database pada region yang sama dengan API.
   - Gunakan internal URL untuk API di Render dan URL direct untuk operasi migrasi yang memerlukan koneksi langsung.
   - Jalankan migration, validasi akses private network, dan aktifkan backup sesuai retention yang tersedia.
   - Dokumen: [Render — PostgreSQL](https://render.com/docs/databases).
4. **Aiven for PostgreSQL**
   - Buat managed PostgreSQL service, pilih region/plan, dan unduh connection credentials dengan TLS.
   - Tambahkan connection string pada secret store API, migration URL sebagai `DIRECT_URL`.
   - Uji TLS, pooling/koneksi, restore, dan latensi sebelum cutover.
   - Dokumen: [Aiven — PostgreSQL](https://aiven.io/docs/products/postgresql).
5. **Crunchy Bridge**
   - Buat cluster PostgreSQL dan pilih region/konfigurasi yang memenuhi kebutuhan koneksi dan backup.
   - Salin URL aplikasi dan direct URL; simpan hanya sebagai backend secret.
   - Jalankan migration, restore rehearsal, lalu lakukan cutover dan monitor koneksi.
   - Dokumen: [Crunchy Bridge — Documentation](https://docs.crunchybridge.com/).

## 7. Backup, pemulihan, dan cutover database

1. Sebelum perubahan besar, buat backup database konsisten dan simpan di lokasi berbeda dari database utama dengan akses terbatas/enkripsi.
2. Untuk dump logical PostgreSQL, gunakan `pg_dump` versi yang kompatibel dan uji hasil restore ke database staging memakai `pg_restore`. Jangan menganggap backup selesai sebelum restore berhasil.
3. Jadwalkan backup otomatis/PITR sesuai opsi provider, retensi, dan target RPO/RTO proyek; dokumentasikan owner dan cara aksesnya.
4. Untuk migrasi provider, freeze perubahan schema sementara, lakukan dump/restore, jalankan `prisma migrate deploy`, lalu verifikasi jumlah data dan smoke test sebelum mengalihkan API.
5. Pertahankan database asal dalam mode read-only selama periode verifikasi. Jangan hapus sumber sampai backup dan rollback plan terbukti.
6. Setelah cutover, pantau error koneksi, latency, pool exhaustion, serta biaya/kuota; siapkan rollback dengan mengembalikan URL API hanya jika data tidak divergen.

> Backup bukan pengganti migration plan dan pemulihan teruji. Evaluasi harga, kuota gratis, region, retention, dukungan runtime Next.js, dan batasan provider pada saat deployment karena dapat berubah.
