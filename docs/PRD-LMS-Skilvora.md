# Product Requirements Document (PRD)
# Simple LMS — Skilvora (Kelas Online Mini Bidang IT)

| | |
|---|---|
| **Nama Produk** | **Skilvora** — *Skill Explorer, platform belajar IT terarah* |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 2 September 2026 |
| **Fokus Bisnis** | EdTech — Kursus Online Bidang IT (Full Stack Development, Roadmap Karier Tech) |
| **Model Tenant** | Single-tenant (1 platform dikelola 1 penyedia kursus/mentor) |
| **Platform** | Web App (Halaman Publik/Marketing + Learning Dashboard Siswa + Admin/Instruktur Panel) |
| **Status** | Draft untuk pengembangan |

---

## 1. Latar Belakang & Ringkasan Eksekutif

### 1.1 Latar Belakang
Belajar pemrograman secara otodidak dari video YouTube atau tutorial tersebar sering membuat pemula kebingungan soal **urutan belajar yang benar** (mis. harus belajar apa dulu sebelum React, kapan waktunya belajar backend). Selain itu:

- **Tidak ada struktur roadmap yang jelas** — pemula sering loncat-loncat topik tanpa fondasi yang kuat, akhirnya menyerah di tengah jalan.
- **Tidak ada bukti kompetensi** — setelah belajar otodidak, tidak ada sertifikat/portofolio resmi yang bisa ditunjukkan ke calon pemberi kerja.
- **Tidak ada tracking progress** — sulit mengukur seberapa jauh progres belajar dan materi mana yang sudah/belum dikuasai.
- **Minim motivasi & akuntabilitas** — belajar sendirian tanpa target/deadline membuat banyak pemula gagal konsisten.

### 1.2 Solusi
**Skilvora** adalah platform kelas online mini yang berfokus pada **pembelajaran terstruktur bidang IT** (dimulai dari Full Stack Web Development), dilengkapi dengan **roadmap belajar visual**, video pembelajaran per modul, progress tracking otomatis, dan **sertifikat digital** bagi siswa yang menyelesaikan kelas. Berbeda dari platform video course biasa, Skilvora menekankan **jalur belajar yang runtut (learning path)** sehingga siswa tahu persis "habis ini belajar apa".

### 1.3 Model Bisnis
- Model **freemium**: sebagian modul awal dapat diakses gratis (untuk menarik pengguna baru), modul lanjutan & sertifikat memerlukan pembelian kelas (one-time payment per kelas/bundle).
- Tidak ada langganan bulanan di V1 — model **beli putus per kelas** agar sederhana untuk MVP awal (skala beginner).

---

## 2. Tujuan Produk (Goals & Objectives)

### 2.1 Business Goals
1. Menjadi platform belajar IT yang dikenal karena **kejelasan roadmap belajarnya**, bukan sekadar kumpulan video.
2. Membangun basis siswa aktif yang menyelesaikan kelas sampai tuntas (bukan hanya mendaftar lalu berhenti di tengah jalan).
3. Menghasilkan pendapatan dari penjualan kelas berbayar dengan tingkat penyelesaian (completion rate) yang menjadi nilai jual utama dibanding kompetitor.

### 2.2 Product Goals
1. Siswa dapat melihat **roadmap visual** dari 0 hingga mahir untuk jalur belajar tertentu (mis. "Roadmap Full Stack Web Developer") sebelum mulai belajar.
2. Siswa dapat mengikuti kelas berbasis modul (video + materi bacaan + kuis) dengan progress yang otomatis tersimpan.
3. Siswa yang menyelesaikan seluruh modul dalam satu kelas dan lulus kuis akhir mendapatkan **sertifikat digital** yang dapat diunduh dan dibagikan (mis. ke LinkedIn).
4. Instruktur/Admin dapat mengelola konten kelas (video, materi, kuis) tanpa bantuan developer.
5. Website ramah SEO agar mudah ditemukan calon siswa yang mencari "belajar full stack developer dari nol", dsb.

### 2.3 Success Metrics (KPI)
| Metrik | Target |
|---|---|
| Completion rate (siswa yang menyelesaikan kelas dari yang mendaftar) | ≥ 40% dalam 3 bulan pertama |
| Waktu rata-rata siswa menyelesaikan 1 modul | Sesuai estimasi durasi modul ± 20% |
| Jumlah sertifikat diterbitkan per bulan | Meningkat konsisten bulan ke bulan |
| Conversion rate dari kelas gratis ke kelas berbayar | ≥ 10% |
| Skor SEO/Lighthouse (Performance & SEO) | ≥ 85/100 |
| Trafik organik dari pencarian terkait "belajar [topik] dari nol" | Masuk halaman 1 Google untuk minimal 3 keyword target dalam 6 bulan |

---

## 3. Target Pengguna & Persona

### 3.1 Segmen Target
- Pemula yang ingin beralih karier ke bidang IT (career switcher).
- Mahasiswa/fresh graduate non-IT maupun IT yang ingin memperdalam skill praktis full stack development.
- Individu otodidak yang sudah pernah belajar sedikit-sedikit tapi butuh struktur yang jelas.

### 3.2 Persona

**Persona 1 — Dimas (Career Switcher)**
- Usia 24–32 tahun, sebelumnya bekerja di bidang non-IT (mis. akuntansi/marketing), ingin pindah karier jadi web developer.
- Bingung harus mulai dari mana, sering ganti-ganti sumber belajar tanpa progress jelas.
- Butuh **roadmap yang jelas** dan bukti sertifikat untuk melamar kerja/magang IT.
- Mengakses via **laptop di malam hari/akhir pekan** (belajar sambil kerja).

**Persona 2 — Nadia (Mahasiswa Semester Akhir)**
- Usia 20–23 tahun, mahasiswa Informatika yang ingin belajar praktik full stack di luar materi kuliah yang terlalu teoritis.
- Ingin portofolio & sertifikat tambahan untuk CV magang.
- Mengakses via **laptop kampus/kos**, belajar di sela waktu kuliah.

**Persona 3 — Kak Rangga (Instruktur/Content Creator)**
- Usia 27–35 tahun, mentor/instruktur yang membuat & mengelola materi kelas.
- Perlu tools sederhana untuk upload video, menyusun modul, dan membuat kuis tanpa ribet teknis.
- Mengakses via **laptop**, sesekali cek progress siswa dari HP.

**Persona 4 — Admin Platform (bisa merangkap Owner)**
- Mengelola pembayaran, mengelola akses siswa, memantau statistik penyelesaian kelas, dan menerbitkan/mencabut sertifikat jika diperlukan.

---

## 4. Peran Pengguna & Hak Akses (User Roles & Permissions)

Sistem menggunakan **Role-Based Access Control (RBAC)**.

| Role | Level | Platform Akses | Deskripsi |
|---|---|---|---|
| **Admin** | Platform | Admin Panel | Akses penuh: kelola kelas, instruktur, siswa, pembayaran, sertifikat, roadmap |
| **Instruktur** | Platform | Instructor Panel | Membuat & mengelola konten kelas miliknya sendiri (modul, video, kuis) |
| **Siswa (Student)** | Publik (Auth) | Learning Dashboard | Mengikuti kelas yang dibeli/gratis, mengerjakan kuis, mengunduh sertifikat |
| **Pengunjung (Guest)** | Publik (Non-Auth) | Halaman Publik | Melihat landing page, roadmap preview, daftar kelas, dan preview modul gratis |

### 4.1 Matriks Hak Akses (RBAC Detail)

| Modul / Fitur | Admin | Instruktur | Siswa | Guest |
|---|:---:|:---:|:---:|:---:|
| Kelola roadmap belajar (buat/edit path) | ✅ | ❌ | ❌ | ❌ |
| Buat & kelola kelas milik sendiri | 🔶 (semua kelas) | ✅ (kelas sendiri) | ❌ | ❌ |
| Upload video & materi modul | 🔶 | ✅ (kelas sendiri) | ❌ | ❌ |
| Buat kuis & tentukan passing grade | 🔶 | ✅ (kelas sendiri) | ❌ | ❌ |
| Kelola harga kelas & status publish | ✅ | 🔶 (ajukan ke Admin) | ❌ | ❌ |
| Enroll/beli kelas | ❌ | ❌ | ✅ | ❌ (harus daftar dulu) |
| Akses video & materi kelas yang diikuti | ❌ | ✅ (preview kelas sendiri) | ✅ (kelas yang di-enroll) | 🔶 (modul gratis saja) |
| Mengerjakan kuis & melihat progress pribadi | ❌ | ❌ | ✅ | ❌ |
| Unduh sertifikat | ❌ | ❌ | ✅ (setelah lulus) | ❌ |
| Lihat statistik progress siswa per kelas | ✅ | ✅ (kelas sendiri) | ❌ | ❌ |
| Kelola pembayaran & transaksi | ✅ | ❌ | ❌ | ❌ |
| Terbitkan/cabut sertifikat manual | ✅ | 🔶 (ajukan ke Admin) | ❌ | ❌ |

Legenda: ✅ Full akses · 🔶 Akses terbatas/butuh approval · ❌ Tidak ada akses

---

## 5. Ruang Lingkup (Scope)

### 5.1 In-Scope (MVP)
- **Roadmap Belajar Visual** — tampilan alur belajar (mis. "Roadmap Full Stack Web Developer": HTML/CSS → JavaScript Dasar → Framework Frontend → Backend Dasar → Database → Deployment), dengan penanda kelas mana yang terkait tiap tahap roadmap.
- **Katalog Kelas** — daftar kelas dengan kategori (Frontend, Backend, Database, Deployment/DevOps Dasar, dsb), filter, dan pencarian.
- **Halaman Detail Kelas** — deskripsi kelas, daftar modul, estimasi durasi, level (pemula/menengah), preview modul gratis, harga (jika berbayar).
- **Modul Pembelajaran** — tiap kelas terdiri dari beberapa modul; tiap modul berisi video pembelajaran, materi bacaan (teks/markdown), dan kuis di akhir modul.
- **Progress Tracking** — sistem otomatis mencatat modul yang sudah diselesaikan siswa, menampilkan persentase progress per kelas.
- **Kuis & Passing Grade** — kuis pilihan ganda di akhir tiap modul dan kuis akhir kelas; siswa harus mencapai nilai minimum (passing grade) untuk lanjut/lulus.
- **Sertifikat Digital** — diterbitkan otomatis (generate PDF) setelah siswa menyelesaikan seluruh modul dan lulus kuis akhir kelas, berisi nama siswa, nama kelas, tanggal selesai, dan kode verifikasi unik.
- **Halaman Verifikasi Sertifikat Publik** — siapa saja dapat memasukkan kode sertifikat untuk memverifikasi keasliannya (mis. untuk keperluan HR yang mengecek CV pelamar).
- **Enrollment & Pembayaran Sederhana** — siswa dapat enroll kelas gratis langsung, atau membeli kelas berbayar (one-time payment via transfer manual/payment gateway sederhana).
- **Dashboard Siswa** — menampilkan kelas yang sedang diikuti, progress tiap kelas, dan sertifikat yang sudah didapat.
- **Instructor Panel** — instruktur dapat membuat kelas baru, menyusun modul, upload video (link embed atau upload langsung), dan membuat kuis.
- **SEO Dasar** — meta tag dinamis per halaman kelas & roadmap, sitemap otomatis, URL yang deskriptif (slug).

### 5.2 Out-of-Scope (Fase Berikutnya / Non-Goals di V1)
- Live class/webinar real-time — V1 fokus video on-demand (asynchronous learning).
- Forum diskusi/komunitas antar siswa — dicatat sebagai kandidat fase 2.
- Model langganan bulanan (subscription) — V1 hanya beli putus per kelas.
- Coding playground/online code editor interaktif di dalam platform — siswa berlatih di lingkungan masing-masing (mis. VS Code lokal) untuk V1.
- Sistem afiliasi/reseller kelas.
- Aplikasi mobile native — V1 fokus web responsive.
- Multi-instruktur dengan sistem revenue-sharing otomatis — di V1 instruktur dianggap bagian dari tim internal platform, bukan marketplace instruktur eksternal.

---

## 6. Functional Requirements (Kebutuhan Fungsional)

### 6.1 Modul: Autentikasi & Manajemen User
| ID | Requirement |
|---|---|
| FR-AUTH-01 | Siswa dapat mendaftar akun (nama, email, password) dengan verifikasi email |
| FR-AUTH-02 | Login menggunakan email + password, serta dukungan login sosial (Google) untuk mempercepat pendaftaran |
| FR-AUTH-03 | Admin dapat membuat akun Instruktur dengan role tertentu |
| FR-AUTH-04 | Password reset via email/OTP |
| FR-AUTH-05 | Sesi login siswa tetap valid dalam jangka waktu wajar (refresh token) agar tidak sering logout saat belajar |

### 6.2 Modul: Roadmap Belajar
| ID | Requirement |
|---|---|
| FR-ROAD-01 | Admin dapat membuat & menyusun **Roadmap** (mis. "Roadmap Full Stack Web Developer") berupa urutan tahapan belajar (node), tiap node dapat dikaitkan dengan satu atau lebih Kelas |
| FR-ROAD-02 | Roadmap ditampilkan secara visual (diagram alur/flowchart) di halaman publik agar calon siswa memahami jalur belajar sebelum mendaftar |
| FR-ROAD-03 | Setiap node roadmap menampilkan status bagi siswa yang sudah login: "Belum Dimulai", "Sedang Berjalan", atau "Selesai", berdasarkan progress kelas terkait |
| FR-ROAD-04 | Admin dapat membuat lebih dari satu roadmap (mis. "Roadmap Frontend Developer", "Roadmap Backend Developer") untuk jalur berbeda |

### 6.3 Modul: Manajemen Kelas & Konten (Instructor Panel)
| ID | Requirement |
|---|---|
| FR-CLASS-01 | Instruktur/Admin dapat membuat kelas baru: judul, deskripsi, kategori, level (pemula/menengah/lanjutan), thumbnail, harga (0 untuk gratis) |
| FR-CLASS-02 | Instruktur dapat menyusun kelas menjadi beberapa **modul** dengan urutan tertentu (drag-drop reorder) |
| FR-CLASS-03 | Setiap modul dapat berisi: video pembelajaran (upload/embed dari platform video), materi bacaan (rich text/markdown), dan lampiran file pendukung (opsional) |
| FR-CLASS-04 | Instruktur dapat menandai modul tertentu sebagai **preview gratis** (dapat diakses tanpa membeli kelas) untuk menarik minat calon siswa |
| FR-CLASS-05 | Instruktur dapat mengatur status kelas (draft/published) — kelas draft tidak tampil di katalog publik |
| FR-CLASS-06 | Admin dapat meninjau & menyetujui kelas yang diajukan Instruktur sebelum dipublikasikan (opsional, tergantung kebijakan platform) |

### 6.4 Modul: Kuis & Penilaian
| ID | Requirement |
|---|---|
| FR-QUIZ-01 | Instruktur dapat membuat kuis pilihan ganda di akhir tiap modul, dengan jumlah soal & passing grade yang dapat dikonfigurasi |
| FR-QUIZ-02 | Instruktur dapat membuat **kuis akhir kelas** (final assessment) yang harus dilalui siswa untuk mendapatkan sertifikat |
| FR-QUIZ-03 | Sistem menampilkan hasil kuis (skor & jawaban benar/salah) segera setelah siswa submit |
| FR-QUIZ-04 | Siswa yang tidak lulus passing grade dapat mengulang kuis (dengan batas percobaan yang dapat dikonfigurasi Instruktur, mis. maks. 3x) |
| FR-QUIZ-05 | Sistem mencatat skor tertinggi/terakhir siswa per kuis untuk keperluan laporan progress |

### 6.5 Modul: Progress Tracking
| ID | Requirement |
|---|---|
| FR-PROG-01 | Sistem otomatis mencatat status penyelesaian tiap modul (video ditonton sampai selesai/materi dibuka, kuis modul lulus) |
| FR-PROG-02 | Siswa dapat melihat persentase progress keseluruhan tiap kelas yang diikuti di Dashboard |
| FR-PROG-03 | Siswa dapat melanjutkan belajar dari modul terakhir yang belum diselesaikan ("Lanjutkan Belajar") |
| FR-PROG-04 | Instruktur/Admin dapat melihat statistik progress seluruh siswa per kelas (mis. berapa % siswa sudah sampai modul tertentu) untuk mengidentifikasi modul yang sering membuat siswa berhenti (drop-off point) |

### 6.6 Modul: Sertifikat Digital
| ID | Requirement |
|---|---|
| FR-CERT-01 | Sistem otomatis menerbitkan **sertifikat digital (PDF)** ketika siswa menyelesaikan seluruh modul wajib dan lulus kuis akhir kelas |
| FR-CERT-02 | Sertifikat memuat: nama siswa, nama kelas, tanggal penyelesaian, nama instruktur, dan **kode verifikasi unik** |
| FR-CERT-03 | Siswa dapat mengunduh sertifikat dalam format PDF dan membagikan tautan sertifikat (mis. ke LinkedIn) |
| FR-CERT-04 | Tersedia **halaman verifikasi sertifikat publik** di mana siapa saja dapat memasukkan kode verifikasi untuk mengecek keabsahan sertifikat (nama pemilik, kelas, tanggal terbit) |
| FR-CERT-05 | Admin dapat mencabut (revoke) sertifikat tertentu jika ditemukan kecurangan, dengan status yang langsung tercermin di halaman verifikasi publik |

### 6.7 Modul: Enrollment & Pembayaran
| ID | Requirement |
|---|---|
| FR-ENROLL-01 | Siswa dapat mendaftar (enroll) ke kelas gratis secara instan tanpa proses pembayaran |
| FR-ENROLL-02 | Siswa dapat membeli kelas berbayar melalui pembayaran satu kali (transfer manual dengan upload bukti, atau integrasi payment gateway sederhana seperti QRIS) |
| FR-ENROLL-03 | Setelah pembayaran terkonfirmasi (manual oleh Admin atau otomatis via webhook gateway), siswa mendapat akses penuh ke seluruh modul kelas tsb |
| FR-ENROLL-04 | Siswa dapat melihat riwayat kelas yang pernah dibeli beserta status pembayaran |

### 6.8 Modul: Dashboard Siswa
| ID | Requirement |
|---|---|
| FR-DASH-01 | Dashboard menampilkan ringkasan: kelas yang sedang diikuti beserta progress, roadmap yang sedang dijalani, dan sertifikat yang telah diperoleh |
| FR-DASH-02 | Siswa dapat mengakses profil pribadi (nama, email, foto) dan mengeditnya |

### 6.9 Modul: SEO & Halaman Publik
| ID | Requirement |
|---|---|
| FR-SEO-01 | Setiap halaman kelas & roadmap memiliki meta title/description dinamis yang dapat dioptimasi (mis. "Belajar Full Stack Web Developer dari Nol — Skilvora") |
| FR-SEO-02 | Sistem menghasilkan sitemap.xml otomatis yang mencakup seluruh halaman kelas & roadmap yang published |
| FR-SEO-03 | Struktur URL deskriptif dan SEO-friendly (mis. `/roadmap/full-stack-web-developer`, `/kelas/dasar-javascript-untuk-pemula`) |
| FR-SEO-04 | Mendukung Open Graph tags agar tampilan preview menarik saat dibagikan di media sosial |
| FR-SEO-05 | Halaman kelas menampilkan structured data (Schema.org `Course`) untuk meningkatkan peluang tampil sebagai rich result di hasil pencarian Google |

---

## 7. User Flows Utama

### 7.1 Flow: Siswa Baru Mendaftar & Mulai Belajar
1. Calon siswa menemukan Skilvora dari pencarian Google (mis. "belajar full stack developer dari nol") atau media sosial.
2. Calon siswa melihat halaman **Roadmap Full Stack Web Developer** → memahami urutan belajar yang disarankan.
3. Calon siswa mendaftar akun (atau login via Google) → diarahkan ke katalog kelas pertama di roadmap tsb.
4. Siswa meng-enroll kelas gratis pertama → langsung dapat mengakses video & materi modul pertama.
5. Siswa menyelesaikan modul (menonton video, membaca materi, mengerjakan kuis modul) → progress otomatis tercatat.
6. Setelah semua modul selesai, siswa mengerjakan kuis akhir kelas → jika lulus, sertifikat otomatis diterbitkan dan dapat diunduh.
7. Siswa melanjutkan ke kelas berikutnya sesuai roadmap (yang mungkin berbayar) untuk melanjutkan progres belajarnya.

### 7.2 Flow: Instruktur Membuat Kelas Baru
1. Instruktur login ke Instructor Panel.
2. Instruktur membuat kelas baru: judul, deskripsi, kategori, level, harga.
3. Instruktur menambahkan modul satu per satu: upload/embed video, tulis materi, tandai modul preview gratis jika diperlukan.
4. Instruktur membuat kuis untuk tiap modul dan kuis akhir kelas, menentukan passing grade.
5. Instruktur mengatur status kelas menjadi "Published" (atau mengajukan review ke Admin, sesuai kebijakan platform).
6. Kelas tampil di katalog publik dan dapat mulai di-enroll oleh siswa.

### 7.3 Flow: Penerbitan & Verifikasi Sertifikat
1. Siswa menyelesaikan seluruh modul wajib pada suatu kelas.
2. Siswa mengerjakan kuis akhir kelas → sistem mengecek apakah skor memenuhi passing grade.
3. Jika lulus: sistem otomatis men-generate sertifikat PDF dengan kode verifikasi unik, dan mengirim notifikasi ke siswa bahwa sertifikat sudah tersedia di Dashboard.
4. Siswa mengunduh sertifikat dan (opsional) membagikan link verifikasi sertifikat ke media sosial/LinkedIn/CV.
5. Pihak ketiga (mis. HR calon pemberi kerja) dapat membuka halaman verifikasi publik Skilvora, memasukkan kode verifikasi dari sertifikat, dan melihat keabsahannya (nama, kelas, tanggal terbit, status valid/dicabut).

### 7.4 Flow: Siswa Membeli Kelas Berbayar
1. Siswa menyelesaikan kelas gratis pertama dan ingin melanjutkan ke kelas berbayar berikutnya di roadmap.
2. Siswa membuka halaman detail kelas berbayar → melihat preview modul gratis untuk menilai kualitas sebelum membeli.
3. Siswa klik "Beli Kelas" → memilih metode pembayaran (transfer manual/QRIS).
4. Jika transfer manual: siswa upload bukti transfer → status "Menunggu Konfirmasi" → Admin memverifikasi → akses kelas terbuka.
5. Jika QRIS: pembayaran dikonfirmasi otomatis via webhook → akses kelas langsung terbuka.
6. Siswa mendapat notifikasi akses kelas telah aktif dan dapat mulai belajar.

---

## 8. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Requirement |
|---|---|
| **Performance** | Waktu loading halaman katalog/kelas < 2.5 detik; video streaming menggunakan adaptive bitrate atau layanan hosting video pihak ketiga agar tidak membebani server utama |
| **SEO** | Meta tag dinamis, sitemap otomatis, structured data `Course` (Schema.org), Core Web Vitals sesuai standar Google, mobile-friendly |
| **Security** | Password di-hash (bcrypt); video kelas berbayar tidak dapat diakses langsung via URL publik tanpa autentikasi & enrollment yang valid (proteksi konten premium) |
| **Scalability** | Struktur data roadmap-kelas-modul dirancang fleksibel agar mudah menambah kategori roadmap baru (mis. Data Science, Mobile Dev) di fase berikutnya |
| **Availability** | Target uptime ≥ 99%; video pembelajaran idealnya di-hosting di layanan pihak ketiga (CDN video) untuk keandalan streaming |
| **Usability** | Alur enrollment hingga mulai belajar harus dapat diselesaikan siswa baru tanpa training, maksimal dalam 5 langkah |
| **Auditability** | Penerbitan & pencabutan sertifikat tercatat log (siapa yang mencabut, kapan, alasan) untuk menjaga integritas sistem sertifikasi |
| **Compatibility** | Mendukung browser modern & responsive di berbagai perangkat, mengingat siswa mungkin belajar dari HP saat commuting |
| **Data Privacy** | Data pribadi siswa (nama, email) dan riwayat progress belajar dikelola sesuai kepatuhan UU PDP |
| **Localization** | Bahasa Indonesia sebagai default, format tanggal Indonesia, zona waktu WIB |

---

## 9. Model Data / Entitas Utama (High-Level Data Model)

> Catatan: Ini adalah gambaran entitas tingkat tinggi untuk memandu perancangan database (ERD detail dibuat saat fase technical design).

**Entitas Inti:**
- `User` — id, nama, email, password_hash, role (admin/instruktur/siswa), foto_profil
- `Roadmap` — id, judul, deskripsi, slug, status (draft/published)
- `RoadmapNode` — id, roadmap_id, judul_tahap, urutan, class_id (referensi kelas terkait tahap ini)
- `Category` — id, nama_kategori (Frontend/Backend/Database/DevOps Dasar, dsb)
- `Class` (Kelas) — id, instruktur_id, category_id, judul, slug, deskripsi, level, thumbnail, harga, status (draft/published)
- `Module` — id, class_id, judul, urutan, video_url, materi_konten (rich text/markdown), is_preview_gratis
- `Quiz` — id, module_id (nullable jika kuis akhir kelas), class_id, tipe (modul/akhir_kelas), passing_grade, max_percobaan
- `QuizQuestion` — id, quiz_id, pertanyaan, pilihan_jawaban (JSON), jawaban_benar
- `QuizAttempt` — id, quiz_id, user_id, skor, lulus (boolean), attempt_ke, submitted_at
- `Enrollment` — id, user_id, class_id, status (aktif/pending_payment), enrolled_at
- `ModuleProgress` — id, enrollment_id, module_id, status (belum/sedang/selesai), completed_at
- `Payment` — id, enrollment_id, nominal, metode, status, bukti_transfer_url, confirmed_by, confirmed_at
- `Certificate` — id, user_id, class_id, kode_verifikasi, status (valid/dicabut), issued_at, revoked_reason
- `SeoMeta` — id, halaman_referensi_id, halaman_tipe (class/roadmap), meta_title, meta_description, og_image

**Relasi Kunci:**
- 1 `Roadmap` → banyak `RoadmapNode` → tiap `RoadmapNode` merujuk ke 1 `Class`.
- 1 `Class` → banyak `Module` → tiap `Module` dapat memiliki 1 `Quiz` (tipe modul).
- 1 `Class` juga dapat memiliki 1 `Quiz` bertipe `akhir_kelas` sebagai syarat kelulusan.
- 1 `User` (siswa) → banyak `Enrollment` → tiap `Enrollment` memiliki banyak `ModuleProgress` (satu per modul di kelas tsb).
- 1 `Enrollment` yang telah menyelesaikan semua `ModuleProgress` dan lulus `Quiz` akhir_kelas akan memicu pembuatan 1 `Certificate`.
- `Certificate.kode_verifikasi` bersifat unik dan menjadi kunci pencarian di halaman verifikasi publik.

---

## 10. Pertimbangan Teknis (Technical Considerations)

> Bagian ini bersifat rekomendasi awal untuk memudahkan tahap development, bukan keputusan final arsitektur.

- **Arsitektur:** Single-tenant sederhana, dengan pemisahan Server Component untuk halaman publik/SEO (katalog kelas, roadmap, verifikasi sertifikat) dan Client Component untuk area interaktif (video player, kuis, dashboard progress).
- **Backend:** REST API dengan autentikasi JWT + refresh token, middleware RBAC per endpoint (khususnya proteksi akses video/modul berbayar).
- **Database:** PostgreSQL, skema relasional untuk roadmap-kelas-modul-progress yang saling terhubung.
- **Video Hosting:** Untuk MVP, disarankan menggunakan layanan video hosting pihak ketiga dengan proteksi embed (mis. Vimeo Pro/Bunny Stream/Mux) daripada self-hosting video mentah, agar streaming lebih andal dan hemat biaya bandwidth server sendiri.
- **Generate Sertifikat PDF:** Menggunakan library generate PDF di sisi backend (mis. template HTML-to-PDF) yang dipicu otomatis oleh event "siswa lulus kuis akhir kelas", disertai dengan penyimpanan `kode_verifikasi` unik (mis. UUID pendek) di database untuk pencarian di halaman verifikasi.
- **SEO Rendering Strategy:** Manfaatkan **Static Site Generation (SSG)/Incremental Static Regeneration (ISR)** pada Next.js untuk halaman katalog kelas, detail kelas, dan roadmap (konten relatif jarang berubah dan penting untuk SEO), sementara area belajar (video/kuis) menggunakan Client Component setelah autentikasi.
- **Proteksi Konten Premium:** Endpoint video/materi kelas berbayar harus memvalidasi status `Enrollment` yang aktif sebelum mengembalikan URL/token akses video (mis. signed URL dengan masa berlaku singkat), guna mencegah pembagian akses ilegal.
- **Hosting/Infra:** Frontend Next.js di Vercel (memanfaatkan ISR & CDN untuk performa SEO), backend NestJS di VPS/container sesuai standar CayLabs Core Engine.

---

## 11. Roadmap / Rencana Rilis

| Fase | Fitur Utama | Estimasi |
|---|---|---|
| **Fase 0 — Setup & Konten Awal** | Setup dari CayLabs Core Engine, auth, struktur data roadmap-kelas-modul, upload konten kelas pertama | 1-2 minggu |
| **Fase 1 — MVP Inti** | Katalog kelas, halaman detail kelas, enrollment kelas gratis, pemutaran video & materi modul, progress tracking dasar | 3-4 minggu |
| **Fase 2 — Kuis & Sertifikat** | Modul kuis per modul & kuis akhir kelas, generate sertifikat otomatis, halaman verifikasi sertifikat publik | 2-3 minggu |
| **Fase 3 — Roadmap Visual & Monetisasi** | Tampilan roadmap visual interaktif, enrollment kelas berbayar (transfer manual/QRIS), instructor panel lengkap | 3-4 minggu |
| **Fase 4 — SEO & Optimasi** | Meta tag dinamis, sitemap, structured data Course, optimasi performa (Lighthouse) | 1-2 minggu |
| **Fase 5 — Pengembangan Lanjutan (Post-MVP)** | Forum diskusi, langganan bulanan, live class, coding playground interaktif, marketplace multi-instruktur | TBD |

---

## 12. Risiko & Asumsi

### 12.1 Risiko
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Siswa berhenti di tengah jalan (drop-off) tanpa menyelesaikan kelas | Completion rate rendah, target bisnis tidak tercapai | Progress tracking yang jelas, notifikasi pengingat, desain modul yang tidak terlalu panjang per sesi |
| Konten video/materi dibagikan ilegal ke luar platform | Kerugian pendapatan dari penjualan kelas berbayar | Signed URL dengan masa berlaku singkat, watermark/identitas siswa pada video (opsional fase lanjut) |
| Sertifikat dipalsukan/diklaim oleh pihak yang tidak menyelesaikan kelas | Merusak kredibilitas sistem sertifikasi | Kode verifikasi unik + halaman verifikasi publik yang dapat dicek siapa saja |
| Konten roadmap tidak relevan/ketinggalan zaman (teknologi IT cepat berubah) | Siswa merasa belajar hal yang sudah usang | Admin/Instruktur perlu proses review & update roadmap secara berkala |
| SEO tidak optimal sehingga sulit bersaing dengan platform besar yang sudah dikenal | Trafik organik rendah, akuisisi siswa mahal | Fokus pada keyword niche & long-tail (mis. "roadmap belajar backend node.js untuk pemula"), konsisten membuat konten pendukung |

### 12.2 Asumsi
- Volume siswa pada tahap awal masih dalam skala kecil-menengah (ratusan hingga ribuan), tidak memerlukan infrastruktur video streaming skala besar sejak awal.
- Instruktur/tim konten mampu memproduksi video pembelajaran berkualitas secara mandiri (di luar cakupan sistem ini).
- Siswa memiliki koneksi internet yang cukup stabil untuk streaming video (tidak dirancang untuk mode offline di V1).

---

## 13. Glosarium

| Istilah | Definisi |
|---|---|
| **Roadmap Belajar** | Alur/urutan tahapan belajar yang disarankan untuk mencapai suatu kompetensi tertentu (mis. Full Stack Developer) |
| **Enrollment** | Proses pendaftaran siswa ke suatu kelas, baik gratis maupun berbayar |
| **Passing Grade** | Nilai minimum yang harus dicapai siswa dalam kuis untuk dinyatakan lulus |
| **Completion Rate** | Persentase siswa yang benar-benar menyelesaikan kelas dari total siswa yang mendaftar |
| **Drop-off Point** | Titik/modul tertentu dalam kelas di mana banyak siswa berhenti belajar dan tidak melanjutkan |
| **Kode Verifikasi Sertifikat** | Kode unik pada sertifikat yang dapat digunakan untuk mengecek keabsahan sertifikat di halaman publik |
| **Structured Data (Schema.org)** | Format data terstruktur yang membantu mesin pencari memahami konten halaman (mis. tipe `Course`) untuk tampil lebih menarik di hasil pencarian |
| **Signed URL** | Tautan sementara dengan masa berlaku terbatas, digunakan untuk melindungi akses ke konten premium seperti video berbayar |

---

## 14. Lampiran — Prioritas Fitur untuk MVP (Ringkasan Cepat)

**Must Have (P0):**
- Auth & role (Admin, Instruktur, Siswa)
- CRUD kelas & modul (video + materi) oleh Instruktur
- Katalog kelas & halaman detail kelas
- Enrollment kelas gratis + progress tracking dasar
- Kuis modul & kuis akhir kelas dengan passing grade
- Generate sertifikat otomatis + halaman verifikasi publik

**Should Have (P1):**
- Roadmap visual dengan status progress per node
- Enrollment kelas berbayar (transfer manual/QRIS)
- Dashboard siswa (ringkasan progress & sertifikat)
- Meta tag SEO dinamis per halaman kelas & roadmap

**Nice to Have (P2):**
- Structured data Schema.org `Course` untuk rich result Google
- Statistik drop-off point per modul untuk Instruktur
- Preview modul gratis pada kelas berbayar
- Pencabutan sertifikat (revoke) oleh Admin

**Future (P3 - Fase 2+):**
- Forum diskusi antar siswa
- Model langganan bulanan
- Live class/webinar real-time
- Coding playground interaktif terintegrasi
- Marketplace multi-instruktur dengan revenue-sharing

---

*Dokumen ini adalah living document — dapat diperbarui seiring hasil diskusi teknis dan feedback pengguna selama proses development.*
