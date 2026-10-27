# Roadmap Pengembangan Skilvora sampai Launch

Dokumen ini memetakan kebutuhan dalam [PRD-LMS-Skilvora.md](./PRD-LMS-Skilvora.md) ke kondisi implementasi yang terlihat di repository, lalu menyusun pekerjaan dari MVP saat ini sampai peluncuran produksi.

## Dasar dan batasan

- Pemeriksaan dilakukan terhadap source code dan skema database yang ada pada saat dokumen ini dibuat, bukan hasil uji end-to-end di lingkungan production.
- Status **Ada** berarti implementasi dasar ditemukan; belum otomatis berarti seluruh acceptance criteria atau kualitas production terpenuhi.
- Status **Parsial** berarti ada fondasi atau UI/API, tetapi alur belum lengkap atau belum saling terhubung.
- Estimasi adalah perkiraan minggu kerja engineering untuk tim kecil. Ketersediaan konten, keputusan bisnis, integrasi eksternal, dan kapasitas tim dapat mengubah jadwal.
- V1 tetap web, single-tenant, video on-demand, dan pembelian per kelas sesuai PRD. Forum, langganan, live class, playground, aplikasi native, serta marketplace multi-instruktur tetap di luar launch V1.

## 1. Kondisi MVP saat ini

| Area PRD | Status | Bukti kondisi saat ini / pekerjaan yang belum selesai |
|---|---|---|
| Auth dasar | Implemented; staging verification pending | API kini menyediakan verifikasi email, reset password, refresh/logout dengan token rotasi, Google OAuth code exchange satu kali, profil, dan guard role. Build API lulus; test unit awal mencakup validasi password, blokir login sebelum verifikasi, dan rotasi refresh. SMTP/OAuth, callback domain staging, serta matriks izin lengkap masih harus diverifikasi dengan provider dan test API tambahan. |
| Katalog dan detail kelas | Parsial | Katalog dan detail published kini dirender server; filter pencarian/kategori/level tersedia di client dan materi premium tidak masuk response publik. Audit konten lengkap, pagination katalog, dan pengukuran SEO masih perlu dilakukan. |
| Pengelolaan kelas/modul | Parsial | Instruktur dapat membuat kelas, menambah/mengubah/menghapus modul, dan menerbitkan kelas dasar. Reorder modul, lampiran, validasi/persetujuan admin, dan kesiapan konten produksi belum lengkap. |
| Pembelajaran dan progress | Implemented; pembayaran masih membatasi verifikasi end-to-end | Enrollment membuat progress awal secara transaksional; API memvalidasi pemilik, status aktif, kelulusan kuis modul, progress, dan resume modul terakhir. UI belajar/dashboard telah disambungkan ke endpoint yang tersedia. Test mencakup enrollment gratis, blokir progress saat pending, dan syarat lulus kuis modul. Alur upgrade seluruh modul, pembayaran berbayar, serta uji browser dengan database staging masih tersisa. |
| Kuis | Implemented; coverage perlu diperluas | Kuis modul/akhir, validasi jawaban, passing grade, batas percobaan, hasil attempt, eligibility kuis akhir, UI instruktur/siswa, dan penerbitan sertifikat setelah lulus diterapkan. Test awal memverifikasi gerbang penyelesaian modul dan penerbitan/audit sertifikat; skenario batas percobaan, jawaban invalid, dan akses lintas kelas masih perlu ditambahkan. |
| Sertifikat | Implemented; acceptance test dan staging pending | Kelulusan server-side memerlukan semua modul selesai dan kuis akhir lulus; penerbitan idempotent, PDF milik siswa, verifikasi publik, pencabutan admin, serta audit trail tersedia. Test service mencakup penerbitan/audit dan pencabutan/audit; PDF aktual, kode tidak valid/revoked, dan pemeriksaan privasi endpoint publik masih perlu diuji di staging. |
| Enrollment dan pembayaran | Admin workflow implemented; real payment intentionally disabled | Status API/UI kini konsisten (`PENDING`, `SUCCESS`, `FAILED`); admin dapat menyetujui/menolak dengan alasan, transaksi update payment/enrollment atomik, dan audit menyimpan pelaku/waktu/alasan. Pemilik memilih prototipe tanpa uang nyata; `PAYMENTS_ENABLED=false` memblokir paid enrollment, upload bukti, dan keputusan admin. Bukti masih URL bebas, bukan object storage R2 terkelola. |
| Proteksi kelas berbayar | Implemented; real-payment gate enabled | API menyaring modul premium untuk enrollment pending dan memvalidasi status/pemilik pada operasi progress/kuis; modul preview tetap dapat ditampilkan. Paid enrollment tidak dapat dibuat saat pembayaran dinonaktifkan. Jangan buka pembayaran sampai R2/object storage dan acceptance test selesai. |
| Dashboard siswa | Parsial | Endpoint dashboard, persentase progress, resume belajar, state error, pembelajaran, dan daftar/unduh sertifikat telah disambungkan. Verifikasi UI end-to-end masih membutuhkan database dan layanan staging. |
| Roadmap | Implemented; staging verification pending | Admin CRUD roadmap/node, pengurutan node, validasi kelas published, halaman detail/daftar SSR, serta status node berdasarkan enrollment/progress siswa tersedia. Cek validasi metadata/sitemap dan data aktual setelah staging terpasang. |
| Admin/instruktur | Parsial | CRUD dasar, pengelolaan akun instruktur, approval/reject pembayaran dengan audit, CRUD roadmap, dan kendali sertifikat tersedia. Approval kelas dan statistik progress/drop-off yang berfungsi masih belum lengkap. |
| SEO | Implemented; measurement pending | Katalog di-render server, pencarian/filter kategori/level interaktif, metadata canonical/Open Graph untuk course dan roadmap, Course JSON-LD, `sitemap.xml` hanya memakai data published, dan `robots.txt` tersedia. Lighthouse/validator/search-console perlu dijalankan pada domain staging/production yang nyata. |
| Quality dan operasi | Improved; not production-ready | CI workflow menjalankan Prisma generate/validate, semua test API, build API/web. Rate limiting global dan khusus auth serta readiness DB ditambahkan; build/test/backup restore/monitoring/privasi/legal review pada provider belum terverifikasi. Prototipe pembayaran wajib tetap nonaktif. |

### Blocker yang harus ditutup sebelum MVP dianggap selesai

1. Verifikasi matriks izin dan ownership seluruh endpoint sensitif dengan test API menyeluruh.
2. Pertahankan `PAYMENTS_ENABLED=false`; pilih dan implementasikan upload bukti private/terkelola (R2 disebut sebagai opsi, belum diintegrasikan) sebelum menerima uang nyata.
3. Lengkapi test browser/end-to-end untuk pembayaran, katalog/roadmap, auth, belajar/kuis, serta PDF/verifikasi/revoke.
4. Deploy staging sungguhan setelah URL/secrets/provider diatur pemilik; jalankan migration dan smoke test.
5. Sebelum launch, buktikan backup/restore, monitoring, privasi/legal review, Lighthouse target, runbook, dan go/no-go owner.

## 2. Urutan fase pengembangan

### Fase 0 — Baseline produk, keputusan, dan staging

**Estimasi:** 1 minggu  
**Tujuan:** menyepakati definisi “siap launch” dan menyediakan lingkungan untuk menguji alur penuh.

**Tahapan**
1. Tandai requirement PRD sebagai must-have V1, should-have sebelum launch, atau post-launch; jangan mengubah scope V1 tanpa persetujuan.
2. Tetapkan keputusan yang belum final: video hosting, alur transfer manual atau gateway, email provider, domain, dan lingkungan hosting.
3. Siapkan staging dengan konfigurasi environment terpisah, database terkelola, URL callback, dan data uji.
4. Siapkan satu kelas gratis dan satu kelas berbayar sebagai data uji; inventarisasi konten kursus yang harus tersedia saat launch.
5. Pecah blocker pada bagian “Kondisi MVP saat ini” menjadi tiket dengan owner dan acceptance criteria.

**Dependensi:** tidak ada.  
**Validasi/Definition of Done**
- Keputusan teknis dan operasional yang menghambat implementasi tercatat.
- Deploy staging berhasil, koneksi database terverifikasi, dan secrets tidak disimpan di repository.
- Alur siswa, instruktur, dan admin dapat diuji dengan akun/kelas staging.

### Fase 1 — Fondasi akun, otorisasi, dan administrasi pengguna

**Estimasi:** 1–2 minggu  
**Tujuan:** memastikan akses sesuai role sebelum alur pembelajaran dan pembayaran dilengkapi.

**Tahapan**
1. Tetapkan role dan matriks izin Admin, Instruktur, Siswa, dan Guest sesuai PRD.
2. Terapkan validasi izin di backend untuk seluruh endpoint admin/instruktur/siswa; UI route protection hanya lapisan tambahan.
3. Lengkapi flow autentikasi V1: verifikasi email, reset password, refresh sesi, error state, dan onboarding sesuai keputusan provider.
4. Pastikan admin dapat membuat akun instruktur; lengkapi profil siswa minimum sesuai kebutuhan dashboard.
5. Tambahkan test untuk role yang boleh dan tidak boleh mengakses endpoint dan resource milik pengguna lain.

**Dependensi:** Fase 0.  
**Validasi/Definition of Done**
- Test matriks izin berhasil untuk setiap role dan endpoint sensitif.
- Siswa tidak dapat mengakses panel admin/instruktur atau data siswa lain.
- Skenario register, login, Google OAuth, logout/expired session, verifikasi email, dan reset password terdokumentasi dan teruji.

### Fase 2 — Kelas, enrollment, pembelajaran, kuis, dan progress

**Estimasi:** 2–3 minggu  
**Tujuan:** menutup loop belajar dari enroll sampai lulus kelas secara konsisten.

**Tahapan**
1. Selesaikan validasi kelas, modul, kategori, urutan/reorder, status draft/published, dan preview gratis.
2. Pada enrollment, buat record progress awal untuk seluruh modul wajib; gunakan transaksi agar enrollment dan progress tidak terpisah.
3. Validasi akses setiap request: hanya enrollment aktif untuk konten premium, preview gratis hanya sesuai policy, dan data enrollment harus milik siswa.
4. Lengkapi tampilan belajar video/materi, tandai progress sesuai aturan PRD, hitung progress kelas, serta tombol lanjutkan dari modul terakhir.
5. Implementasikan kuis modul dan kuis akhir, passing grade, batas percobaan, hasil skor, dan pencatatan skor yang diperlukan.
6. Perbaiki endpoint dashboard siswa dan tampilkan state loading, error, empty, pending payment, serta active secara berbeda.
7. Tambahkan test service/API untuk enrollment, update progress, quiz attempts, dan aturan akses.

**Dependensi:** Fase 1 dan model data yang disepakati di Fase 0.  
**Validasi/Definition of Done**
- Siswa gratis dapat mendaftar dan menyelesaikan seluruh kelas uji.
- Enrollment pending tidak bisa membuka konten premium; enrollment aktif bisa.
- Progress persentase cocok dengan modul wajib yang selesai dan tetap konsisten setelah login ulang.
- Kuis modul dan akhir mencatat skor, lulus/gagal, serta tidak melewati batas percobaan.
- Instructor dapat menyusun konten kelas tanpa bantuan developer untuk alur V1.

### Fase 3 — Sertifikat dan verifikasi publik

**Estimasi:** 1–2 minggu  
**Tujuan:** menerbitkan bukti kelulusan yang valid dan dapat diverifikasi.

**Tahapan**
1. Jadikan kelulusan sebagai aturan server-side: semua modul wajib selesai dan kuis akhir lulus.
2. Pastikan penerbitan idempotent dan kode verifikasi unik; tangani submission berulang tanpa sertifikat ganda.
3. Generate PDF berisi nama siswa, kelas, tanggal selesai, instruktur, dan kode verifikasi.
4. Sediakan endpoint verifikasi publik yang mengembalikan status valid/dicabut dan data minimum yang diminta PRD; jangan membocorkan data pribadi berlebih.
5. Tambahkan halaman unduh/tautan share dan UI hasil verifikasi.
6. Implementasikan revoke oleh admin beserta alasan, waktu, pelaku, dan audit trail.

**Dependensi:** Fase 2.  
**Validasi/Definition of Done**
- Tidak ada sertifikat sebelum syarat kelulusan terpenuhi.
- PDF dapat dibuka dan seluruh data yang diwajibkan benar.
- Kode valid ditemukan publik; kode tidak valid dan sertifikat dicabut menghasilkan status yang jelas.
- Percobaan kuis atau request berulang tidak membuat sertifikat duplikat.

### Fase 4 — Pembayaran dan kendali operasional admin

**Estimasi:** 1–2 minggu untuk transfer manual; integrasi gateway memerlukan estimasi terpisah setelah provider dipilih.  
**Tujuan:** mengaktifkan monetisasi one-time purchase dan kendali administratif yang dapat dijalankan.

**Tahapan**
1. Definisikan satu state machine pembayaran yang konsisten untuk database, API, dan UI: pending, menunggu verifikasi, berhasil, gagal/ditolak.
2. Selesaikan pengiriman bukti transfer dengan penyimpanan yang sesuai; jangan bergantung pada URL yang tidak dapat dipercaya atau dikelola.
3. Buat daftar transaksi admin, detail bukti, approve/reject, identitas pemeriksa, waktu, dan alasan.
4. Saat pembayaran berhasil, ubah payment dan enrollment secara atomik ke status aktif; saat ditolak, tetap blokir kelas berbayar.
5. Lengkapi riwayat pembelian siswa dan notifikasi/status yang mudah dipahami.
6. Jika QRIS/gateway masuk launch, tambahkan webhook tervalidasi, idempotensi, dan pengujian sandbox; jika tidak, dokumentasikan transfer manual sebagai metode launch.

**Dependensi:** Fase 1 dan Fase 2; akses premium dari Fase 2 harus sudah memiliki satu sumber kebenaran.  
**Validasi/Definition of Done**
- Uji end-to-end transfer manual: daftar → bayar → kirim bukti → admin approve/reject → akses berubah benar.
- Request berulang tidak menggandakan tagihan atau mengaktifkan kelas sebelum pembayaran sukses.
- Status di dashboard siswa dan admin selalu sama dengan status database.

### Fase 5 — Roadmap, katalog, dan SEO publik

**Estimasi:** 1–2 minggu  
**Tujuan:** memenuhi pengalaman publik yang menjadi pembeda utama Skilvora dan mendukung akuisisi organik.

**Tahapan**
1. Buat CRUD roadmap/node untuk admin, pengurutan node, validasi relasi kelas, dan status draft/published.
2. Ganti halaman roadmap statis dengan data published dari API; tampilkan kelas terkait dan status node siswa berdasarkan progress enrollment.
3. Lengkapi katalog dengan filter kategori/level dan pencarian sesuai prioritas PRD.
4. Tambahkan metadata dinamis untuk kelas dan roadmap, Open Graph per konten, sitemap untuk konten published, URL slug, dan structured data `Course`.
5. Render konten publik dengan strategi SSR/SSG/ISR yang cocok agar crawler menerima konten, bukan hanya shell client.
6. Lengkapi detail kelas dan preview modul gratis tanpa membocorkan materi premium.

**Dependensi:** Fase 2 untuk status progress; Fase 4 bila preview dan CTA menampilkan status pembelian.  
**Validasi/Definition of Done**
- Admin membuat/mengubah/menerbitkan roadmap dan hasilnya tampil sesuai urutan pada halaman publik.
- Status node siswa cocok dengan progress kelasnya.
- Halaman published memiliki metadata/URL yang benar, sitemap tidak memuat draft, dan structured data lolos validator.
- Uji SEO/Lighthouse awal mencapai target PRD ≥85 untuk Performance dan SEO atau punya daftar isu terukur menuju target.

### Fase 6 — Hardening, kualitas, privasi, dan kesiapan produksi

**Estimasi:** 1–2 minggu  
**Tujuan:** membuktikan produk dapat dioperasikan dengan aman dan andal.

**Tahapan**
1. Buat test otomatis untuk aturan bisnis inti, API, UI kritikal, serta alur end-to-end siswa/instruktur/admin.
2. Jalankan lint, type-check, build, migration dari database kosong, dan upgrade database staging menggunakan proses yang bisa diulang.
3. Uji batas akses, upload/bukti bayar, kuis, sertifikat, validasi input, rate limit yang diperlukan, dan pemisahan data pribadi.
4. Tinjau kepatuhan privasi data Indonesia, kebijakan privasi, syarat penggunaan, persetujuan, retensi, dan prosedur penghapusan data bersama pihak yang bertanggung jawab.
5. Siapkan backup dan uji restore PostgreSQL; sediakan monitoring error, uptime, log operasional, dan alert.
6. Optimalkan performa halaman/video, responsive browser modern, zona waktu WIB, format tanggal Indonesia, dan aksesibilitas alur utama.
7. Dokumentasikan runbook deployment, rollback, incident response, kontak provider, serta prosedur support siswa.

**Dependensi:** Fase 2–5; pekerjaan dapat dimulai lebih awal untuk test dan migration.  
**Validasi/Definition of Done**
- Pipeline validasi otomatis lulus pada perubahan yang akan dirilis.
- Build production berhasil dari clean checkout dan migration dapat dijalankan tanpa kehilangan data uji.
- Restore backup staging berhasil; prosedur rollback dan penanganan insiden telah diuji.
- Halaman utama/kelas memenuhi target performance <2,5 detik sejauh dapat diukur pada kondisi uji yang disepakati.
- Tidak ada blocker pada uji akses role, pembayaran, progress, sertifikat, dan privasi sebelum beta.

### Fase 7 — Beta terbatas, launch, dan stabilisasi

**Estimasi:** 1–2 minggu untuk beta dan launch awal; stabilisasi berjalan setelah rilis.  
**Tujuan:** merilis V1 ke pengguna dengan risiko terkontrol dan mengukur KPI PRD.

**Tahapan**
1. Jalankan beta tertutup menggunakan siswa/instruktur uji dan kelas yang kontennya sudah ditinjau.
2. Ikuti checklist release: backup, migrasi, secrets, domain/SSL, OAuth/email/payment callbacks, analytics minimum, monitoring, support contact, dan rollback.
3. Uji smoke test di production: register/login, katalog, enroll gratis, pembayaran, akses kelas, progress, quiz, sertifikat PDF, verifikasi publik, dashboard, dan admin.
4. Buka akses secara bertahap; pantau error, pembayaran pending, kegagalan streaming, drop-off, dan keluhan siswa.
5. Perbaiki blocker beta sebelum promosi publik; dokumentasikan keputusan go/no-go.
6. Setelah launch, review KPI tiap minggu pada bulan pertama dan tiap bulan setelahnya; prioritaskan perbaikan berdasar completion rate, conversion, waktu menyelesaikan modul, SEO, dan support tickets.

**Dependensi:** seluruh blocker Fase 1–6 selesai dan konten kelas awal tersedia.  
**Validasi/Definition of Done**
- Owner produk menyetujui go/no-go berdasarkan checklist release.
- Semua smoke test production lolos dan jalur rollback tersedia.
- Uptime, error, enrollment/payment funnel, penyelesaian kelas, dan penerbitan sertifikat dapat dipantau.
- Rencana tindak lanjut KPI 30/60/90 hari memiliki owner.

## 3. Sesudah launch — pengembangan fase 2 produk

Fitur berikut memang dicatat PRD sebagai out-of-scope V1/P3 dan **bukan syarat launch**. Masukkan ke roadmap terpisah setelah data beta dan KPI menunjukkan kebutuhan:

1. Forum diskusi/komunitas siswa.
2. Model langganan bulanan.
3. Live class/webinar.
4. Coding playground.
5. Marketplace multi-instruktur dan revenue sharing.
6. Aplikasi mobile native.

Setiap fitur post-launch harus memiliki validasi kebutuhan, estimasi, dan keputusan produk tersendiri; jangan menunda launch V1 untuk membangunnya.

## 4. Ringkasan prioritas

| Urutan | Fase | Prioritas hasil |
|---:|---|---|
| 0 | Baseline dan staging | Keputusan dan lingkungan kerja terukur |
| 1 | Akun dan otorisasi | Role benar, alur akun siap |
| 2 | Learning loop | Enrollment, akses, progress, kuis bekerja end-to-end |
| 3 | Sertifikat | Lulus → PDF → verifikasi/revoke |
| 4 | Pembayaran/admin | Bukti → keputusan → akses kelas |
| 5 | Roadmap/SEO | Halaman publik dinamis dan dapat ditemukan |
| 6 | Hardening | Tes, privasi, backup, monitoring, release process |
| 7 | Beta dan launch | Go-live terukur, smoke test, stabilisasi dan KPI |

**Estimasi total awal:** sekitar 9–16 minggu kerja engineering setelah scope dan dependensi disepakati. Fase 0 dan sebagian Fase 6 dapat berjalan paralel; integrasi payment gateway, produksi konten, serta review hukum/privasi dapat menambah waktu kalender.
