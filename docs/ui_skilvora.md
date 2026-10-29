# ⬛ UI Design System — "Black & Turbo" (ui.md)

> Single Source of Truth untuk seluruh UI milikku sendiri.
> **Hitam netral + satu aksen kuning Turbo.** Tidak ada ungu, tidak ada gradient, tidak ada glow.
> Gaya: editorial, tegas, tipografi besar, garis tipis. Sengaja menjauh dari tampilan "template AI".

---

## 0. Aturan untuk AI Agent (BACA DULU)

1. Baca dokumen ini sebelum membuat atau mengubah UI apa pun.
2. **Dilarang keras: ungu/violet/indigo dalam bentuk apa pun**, gradient, glow, blur dekoratif, glassmorphism, shadow berwarna.
3. Background halaman **selalu hitam netral** (`--bg`). Tidak ada halaman berlatar terang.
4. **Jangan membuat warna, font, radius, atau animasi baru.** Pakai token di bawah.
5. Hanya **satu warna aksen: Turbo**. Sisanya hitam, abu netral, dan putih tulang.
6. Baca juga bagian 1.2 (**Anti-Slop**) sebelum menyusun layout. Layout "hero kiri teks, kanan card, lalu grid 3 card dengan ikon" dilarang.
7. Reuse komponen yang ada sebelum membuat yang baru.
8. Mobile-first, tanpa horizontal overflow, **satu CTA Turbo per viewport**.
9. Ragu? Cari pola paling mirip di dokumen ini. Jangan menciptakan gaya baru.

---

## 1. Visual Identity

Karakter: **gelap, tegas, percaya diri, editorial, bersih.** Seperti majalah desain atau studio kreatif, bukan dashboard SaaS.

Rumus visual:

```text
Hitam netral sebagai latar
+ Garis tipis (hairline) sebagai struktur, bukan card berbayang
+ Tipografi raksasa sebagai elemen visual utama
+ Label mono kecil bernomor (01, 02, 03)
+ Satu aksen: Turbo (kuning), dipakai berani tapi terkontrol
+ Foto / mockup nyata, bukan ilustrasi abstrak
+ Motion halus dan sedikit
```

### 1.1 Prinsip

- **Tipografi adalah desainnya.** Heading besar dan rapat lebih penting daripada dekorasi.
- **Struktur lewat garis.** Pakai divider tipis dan grid, bukan tumpukan card.
- **Kontras tajam.** Hitam pekat, putih tulang, kuning terang. Tidak ada warna tengah yang "ragu".
- **Turbo itu sorotan**, bukan wallpaper. Dipakai di: CTA, satu kata heading, satu blok penuh per halaman, angka kunci.
- **Whitespace lega**, tapi tegas: sebagian section sengaja sangat luas.

### 1.2 Anti-Slop (hal yang bikin UI terlihat "buatan AI", DILARANG)

| Dilarang | Gantinya |
|---|---|
| Warna ungu/violet/indigo, gradient, glow, blur blob | Hitam netral + Turbo |
| Glassmorphism dan card transparan berbayang | Panel solid dengan border 1px |
| Grid 3 card sama besar dengan kotak ikon di atas | Daftar baris bernomor, atau bento dengan ukuran berbeda |
| Ikon dalam kotak rounded berwarna | Nomor mono (`01`) atau tanpa ikon |
| Semua elemen rata tengah | Rata kiri, grid asimetris |
| Semua card `rounded-3xl` | Radius kecil (4–12px), tegas |
| Emoji sebagai ikon, ilustrasi abstrak "orb" | Foto nyata, screenshot produk, tipografi |
| Badge pill dengan titik berkedip di hero | Label mono kecil bergaris |
| Teks deskripsi tipis kelabu kecil | Body minimal 16px, kontras cukup |
| Copywriting generik ("Solusi terbaik", "Revolusioner") | Kalimat konkret dengan angka atau hasil |
| Hero kecil dengan whitespace sia-sia | Heading raksasa yang mengisi lebar layar |

---

## 2. Color

### 2.1 Token

| Token | Hex | Fungsi |
|---|---|---|
| `bg` | `#0A0A0A` | Background halaman |
| `surface` | `#111111` | Panel, sidebar, card |
| `surface-2` | `#181818` | Input, baris hover, area tonal |
| `surface-3` | `#202020` | Dropdown, modal, elemen terangkat |
| `line` | `#262626` | Border / divider default |
| `line-strong` | `#3A3A3A` | Border hover, divider tegas |
| `fg` | `#F2F1EC` | Teks utama, heading (putih tulang hangat) |
| `muted` | `#A3A29C` | Paragraf, deskripsi |
| `subtle` | `#8A8983` | Meta, placeholder, label |
| `turbo` | `#F0E100` | Aksen tunggal: CTA, sorotan, blok penuh |
| `turbo-hover` | `#FFF04D` | Hover Turbo |
| `turbo-press` | `#D6C800` | Pressed Turbo |
| `ink` | `#0A0A0A` | Teks di atas Turbo (sama dengan `bg`) |

Semua abu **netral** (tanpa tint warna). Putih tulang `fg` sedikit hangat agar tidak steril.

### 2.2 Semantik

```text
Success: #4ADE80
Warning: #FB923C   (bukan kuning, supaya tidak tertukar dengan Turbo)
Error:   #FF5C5C
Info:    fg (pakai ikon + teks, bukan warna baru)
```

Badge semantik: latar warna yang sama di opacity 0.12, teks warna penuh, plus ikon atau teks.

### 2.3 Kontras

| Teks | Latar | Catatan |
|---|---|---|
| `fg` | `bg` / `surface` | AAA |
| `muted` | `bg` / `surface` | AA, aman untuk body |
| `subtle` | `bg` | AA, hanya untuk meta/label |
| `ink` | `turbo` | AAA, wajib untuk tombol dan blok Turbo |
| `turbo` | `bg` | AAA, aman untuk teks besar maupun kecil |

### 2.4 Aturan warna

- Turbo boleh dipakai sebagai: tombol utama, satu kata sorotan heading, **satu blok section penuh** per halaman, angka statistik kunci, indikator aktif (garis bawah, titik), dan fokus.
- Di dalam blok Turbo penuh: semua teks `ink`, tombol berlatar `ink` teks `fg`.
- Jangan Turbo untuk paragraf panjang atau border biasa.
- Dilarang membuat atau meminjam warna lain untuk "variasi".

---

## 3. Typography

| Peran | Font |
|---|---|
| Display + heading | **Bricolage Grotesque** |
| Body + UI | **Geist** |
| Label, nomor, meta | **Geist Mono** |

Hanya tiga font ini. Muat lewat `next/font/google` (atau `geist` package).

### Skala

| Peran | Ukuran | Weight | Catatan |
|---|---|---|---|
| Hero H1 | `clamp(3rem, 9vw, 8.5rem)` | 700–800 | `leading-[0.95] tracking-[-0.04em]`, bisa uppercase |
| Section heading | `clamp(2.25rem, 5.5vw, 4.5rem)` | 700 | `leading-[1] tracking-[-0.035em]` |
| Card title | `text-xl` – `text-3xl` | 600 | `tracking-tight`, font display |
| Body | `text-base md:text-lg leading-relaxed` | 400 | warna `muted` |
| Body kecil | `text-sm leading-relaxed` | 400 | **tidak lebih kecil dari 14px** |
| Label mono | `text-xs uppercase tracking-[0.12em]` | 500 | Geist Mono, warna `subtle` |
| Angka besar | `clamp(3.5rem, 8vw, 7rem)` | 700 | `tabular-nums leading-none` |
| Button | `text-sm` | 600 | Geist, tidak uppercase |

### Pola heading: "Marker Turbo" (WAJIB untuk heading section)

Seluruh heading `fg`. **Satu kata kunci** disorot. Dua varian, pilih salah satu per halaman agar konsisten:

```tsx
{/* Varian A: marker blok (hero) */}
<h1 className="font-display text-[clamp(3rem,9vw,8.5rem)] leading-[0.95] tracking-[-0.04em] text-fg">
  Kami bikin brand yang <span className="bg-turbo text-ink px-3 -mx-1 rounded-md">susah dilupakan</span>
</h1>

{/* Varian B: teks Turbo (section) */}
<h2 className="font-display text-[clamp(2.25rem,5.5vw,4.5rem)] leading-none tracking-[-0.035em] text-fg">
  Proses yang <span className="text-turbo">jelas</span>
</h2>
```

Aturan: maksimal 1 frasa (1–3 kata). Heading harus **mengisi lebar**; jangan dibuat kecil dan ditaruh di tengah ruang kosong.

---

## 4. Layout & Spacing

### Grid

- Container: `max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10`.
- Grid 12 kolom di desktop. Layout **asimetris**: heading menempati 8–10 kolom, deskripsi 4–5 kolom di sisi lain.
- Garis vertikal tipis (`border-line`) boleh membagi kolom di desktop.

### Section

- Dipisah **hairline** `border-t border-line`, bukan jarak kosong saja.
- Padding: `py-20` mobile → `py-32` desktop.
- Setiap section dibuka dengan header baris: `[ 02 / Layanan ]` kiri (mono, `subtle`), judul di bawahnya atau di kanan.
- Ritme halaman: gelap → gelap → **blok Turbo penuh** → gelap → footer. Satu blok Turbo per halaman.

### Spacing

- Kelipatan 4px.
- Heading → paragraf: `mt-6`; paragraf → CTA: `mt-10`.
- Jarak antar baris daftar: tinggi baris generous (`py-6` – `py-8`).

---

## 5. Radius, Border, Elevasi

### Radius

| Elemen | Radius |
|---|---|
| Button, input | `rounded-lg` (8px) |
| Card, panel, tabel | `rounded-xl` (12px) |
| Modal, blok besar | `rounded-2xl` (16px) |
| Label/tag | `rounded-md` (6px) |
| Avatar | `rounded-full` |
| Blok Turbo penuh | `rounded-none` (full-bleed) atau `rounded-2xl` bila di dalam container |

Tidak ada pill. Tidak ada radius di atas 16px.

### Border

- Default `border border-line` (1px). Hover: `border-line-strong`.
- Fokus: `outline 2px turbo`, offset 2px.
- Divider daftar: `border-t border-line`.

### Elevasi

**Tanpa drop shadow dan tanpa glow.** Hierarki dibuat dari tingkat surface dan border:

| Level | Tampilan |
|---|---|
| 0 | `bg` |
| 1 | `surface` + `border-line` |
| 2 | `surface-2` + `border-line-strong` |
| Overlay | `surface-3` + `border-line-strong` + overlay `bg/80` |

---

## 6. Komponen

### 6.1 Button

**Primary (Turbo)**: satu per viewport.

```tsx
<button className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-turbo text-ink text-sm font-semibold hover:bg-turbo-hover active:bg-turbo-press active:scale-[0.98] transition duration-200">
  Mulai proyek
  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
</button>
```

**Secondary (outline)**:

```tsx
<button className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-line-strong text-fg text-sm font-semibold hover:bg-surface-2 hover:border-fg/50 transition duration-200">
  Lihat karya
</button>
```

**Link aksi**: `text-fg text-sm font-semibold underline underline-offset-4 decoration-line-strong hover:decoration-turbo`.

Aturan: tinggi ≥ 44px (default `h-12`). Disabled `opacity-40`. Loading: teks tetap ada + spinner kecil.

### 6.2 Input & Form

```tsx
<label htmlFor="email" className="block font-mono text-xs uppercase tracking-[0.12em] text-subtle mb-2">Email</label>
<input
  id="email" type="email" placeholder="nama@email.com"
  className="w-full h-12 rounded-lg bg-surface border border-line px-4 text-base text-fg placeholder:text-subtle
             hover:border-line-strong focus:outline-none focus:border-turbo focus:ring-2 focus:ring-turbo/30 transition"
/>
<p className="mt-2 text-xs text-[#FF5C5C]">Pesan error di sini</p>
```

Aturan: setiap input punya `label`/`aria-label`; error = border merah + teks + ikon; fokus terlihat jelas.

### 6.3 Baris Daftar (pengganti grid 3 card)

Untuk layanan, fitur, langkah, FAQ. **Pakai ini sebelum card.**

```tsx
<ul className="border-t border-line">
  <li className="group grid grid-cols-12 gap-4 items-baseline py-8 border-b border-line hover:bg-surface transition-colors">
    <span className="col-span-2 md:col-span-1 font-mono text-xs text-subtle">01</span>
    <h3 className="col-span-10 md:col-span-5 font-display text-2xl md:text-4xl tracking-tight text-fg">Brand Identity</h3>
    <p className="col-span-12 md:col-span-5 text-muted md:text-lg">Deskripsi konkret satu sampai dua kalimat.</p>
    <span aria-hidden className="hidden md:block col-span-1 justify-self-end text-fg group-hover:text-turbo group-hover:translate-x-1 transition">→</span>
  </li>
</ul>
```

### 6.4 Card (bila memang perlu)

```tsx
<div className="rounded-xl bg-surface border border-line p-6 md:p-8 hover:border-line-strong transition">
  <span className="font-mono text-xs uppercase tracking-[0.12em] text-subtle">Case 01</span>
  <h3 className="mt-3 font-display text-2xl tracking-tight text-fg">Judul</h3>
  <p className="mt-2 text-muted">Deskripsi singkat.</p>
</div>
```

- **Bento:** ukuran card berbeda (1×1, 2×1, 1×2), isinya beragam: foto, angka raksasa, kutipan, mockup. Jangan semua sama.
- **Card Turbo:** `bg-turbo text-ink rounded-xl`, maksimal satu per grup.
- **Card portfolio:** gambar penuh (rasio 4:5 atau 16:10) di atas, judul dan tag di bawah. Hover: gambar zoom 1.03 pelan, judul digarisbawahi Turbo. Gambar nyata, boleh grayscale lalu berwarna saat hover.
- **Stat:** angka raksasa `tabular-nums` + label mono. Satu angka boleh Turbo.

### 6.5 Label & Badge

- **Label section:** `font-mono text-xs uppercase tracking-[0.12em] text-subtle`, format `[ 02 / Layanan ]`.
- **Tag:** `border border-line rounded-md px-2.5 py-1 font-mono text-xs uppercase text-muted`.
- **Status:** tint semantik + ikon/teks.
- **Indikator "tersedia":** titik Turbo 8px + teks mono. Tidak berkedip.

### 6.6 Navbar

- `sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-line` (blur hanya di navbar).
- Kiri: logo. Tengah/kanan: link `text-sm text-muted hover:text-fg`; aktif `text-fg` dengan garis bawah Turbo 2px.
- Kanan: satu tombol Turbo kecil (`h-10`).
- Mobile: tombol menu membuka layar penuh `bg-bg`, link besar (font display), rata kiri.

### 6.7 Footer

`border-t border-line`. Bagian atas: **teks raksasa** (nama brand atau ajakan kontak) ukuran `clamp(4rem, 14vw, 14rem)` di warna `fg`, boleh terpotong sedikit di bawah. Di bawahnya: kolom link `text-sm text-muted hover:text-fg`, dan baris copyright mono `text-xs text-subtle`.

### 6.8 Blok Turbo Penuh (interlude)

Satu per halaman, full-bleed, `bg-turbo text-ink`. Isi: kalimat raksasa (display, uppercase boleh) atau marquee teks besar. Tombol di dalamnya: `bg-ink text-fg rounded-lg`. Ini pengganti "CTA block ungu bergradient".

```tsx
<section className="bg-turbo text-ink">
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-24 md:py-40">
    <h2 className="font-display text-[clamp(3rem,10vw,9rem)] leading-[0.92] tracking-[-0.04em]">
      Punya proyek? Ayo bicara.
    </h2>
    <a className="mt-10 inline-flex h-12 items-center px-6 rounded-lg bg-ink text-fg text-sm font-semibold">Hubungi saya →</a>
  </div>
</section>
```

### 6.9 Tabel, Modal, Toast

- **Tabel:** bungkus `rounded-xl border border-line bg-surface overflow-hidden`; header `bg-surface-2` mono uppercase `subtle`; baris `border-t border-line hover:bg-surface-2`.
- **Modal:** overlay `bg-bg/80`, panel `bg-surface-3 border border-line-strong rounded-2xl p-8 max-w-lg`; Esc menutup, fokus terkunci.
- **Toast:** `bg-surface-3 border border-line-strong rounded-lg text-sm text-fg`, posisi top-right, 3–4 detik.

### 6.10 Icon

- Outline Lucide, `strokeWidth 1.75`, `currentColor`, 16–20px.
- Pakai seperlunya. Ikon **tidak** ditaruh di kotak berwarna.
- Tombol ikon wajib `aria-label`.

### 6.11 State

- **Loading:** skeleton `bg-surface-2 animate-pulse rounded-lg`.
- **Empty:** teks display besar + satu tombol Turbo.
- **Error:** teks `#FF5C5C` + tombol "Coba lagi".

---

## 7. Gambar & Visual

- Pakai **foto nyata, screenshot produk, atau mockup dalam frame browser/HP sederhana** (border `line`, radius 12px).
- Foto boleh grayscale (`grayscale contrast-110`) agar menyatu dengan hitam, berwarna saat hover.
- Tidak ada ilustrasi abstrak, blob, orb, atau mesh gradient.
- Hero ideal: heading raksasa + satu gambar besar atau marquee logo/klien di bawahnya.
- Gambar selalu punya `alt`; dekoratif `alt=""`.

---

## 8. Motion

| Pakai untuk | Aturan |
|---|---|
| Hover link/baris | Warna dan panah bergeser 4px, 200ms |
| Tombol | `active:scale-[0.98]`, 200ms |
| Reveal saat scroll | Fade + naik 12px, 500ms, sekali |
| Teks heading | Boleh reveal per baris (mask naik), 600ms |
| Marquee | Linear, 30–40s, dalam wrapper `overflow-hidden` |
| Gambar hover | Zoom 1.03, 600ms |

Aturan: tidak ada animasi infinite selain marquee; tidak ada parallax berat, bouncing, atau glow berdenyut. **Wajib hormati `prefers-reduced-motion`.**

---

## 9. Urutan Halaman Landing

```text
Navbar (sticky, tombol Turbo kecil)
Hero: heading raksasa (marker Turbo) + 1 paragraf + 1 CTA Turbo + gambar/mockup besar
Marquee klien / teknologi
[ 01 / Layanan ]  daftar baris bernomor
[ 02 / Karya ]    portfolio: card gambar besar (bento)
[ 03 / Angka ]    statistik raksasa
[ 04 / Proses ]   langkah bernomor
BLOK TURBO PENUH  (satu-satunya, CTA akhir)
Footer dengan teks raksasa
```

Setiap section: label bernomor → heading besar → konten → (opsional) satu tautan aksi.

---

## 10. Responsive

Mobile-first: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.

- Heading pakai `clamp()`, tidak perlu breakpoint manual.
- Grid 12 kolom di desktop → 1 kolom di mobile; baris daftar menumpuk (nomor, judul, deskripsi).
- Bento menjadi 1–2 kolom di mobile.
- Tidak boleh horizontal overflow (marquee dalam `overflow-hidden`).
- Konflik: **usability mobile > dekorasi desktop.**

---

## 11. Accessibility

- Ikuti tabel kontras di 2.3.
- Body ≥ 16px di mobile; teks pendukung ≥ 14px.
- Semua input ber-label; tombol ikon ber-`aria-label`.
- Fokus terlihat (outline Turbo 2px) dan keyboard navigation berfungsi.
- Target sentuh ≥ 44×44px.
- Status tidak hanya lewat warna.
- Hormati `prefers-reduced-motion`.

---

## 12. Do & Don't

**Do**
- Hitam netral, garis tipis, tipografi raksasa.
- Satu aksen Turbo, satu blok Turbo penuh per halaman.
- Daftar baris bernomor, bento tidak seragam, foto/mockup nyata.
- Copywriting konkret.

**Don't**
- Ungu, indigo, gradient, glow, blur blob, glassmorphism.
- Pill, radius besar, shadow berwarna.
- Grid 3 card seragam dengan ikon berkotak.
- Semua rata tengah.
- Font atau warna baru di luar token.
- Menyalin teks dummy antar card.

---

## 13. Setup Teknis (Tailwind v4, CSS-first)

`globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --color-bg: #0A0A0A;
  --color-surface: #111111;
  --color-surface-2: #181818;
  --color-surface-3: #202020;
  --color-line: #262626;
  --color-line-strong: #3A3A3A;

  --color-fg: #F2F1EC;
  --color-muted: #A3A29C;
  --color-subtle: #8A8983;

  --color-turbo: #F0E100;
  --color-turbo-hover: #FFF04D;
  --color-turbo-press: #D6C800;
  --color-ink: #0A0A0A;

  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-bricolage), var(--font-geist), sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}

html { color-scheme: dark; }

body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

::selection { background: var(--color-turbo); color: var(--color-ink); }

:focus-visible { outline: 2px solid var(--color-turbo); outline-offset: 2px; }

@keyframes marquee { to { transform: translateX(-50%); } }
.animate-marquee { animation: marquee 35s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

`layout.tsx`:

```tsx
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

<body className={`${bricolage.variable} ${geist.variable} ${geistMono.variable}`}>
```

---

## 14. Checklist Sebelum Commit UI

- [ ] **Tidak ada ungu/violet/indigo, gradient, glow, atau blur dekoratif.**
- [ ] Latar halaman = `#0A0A0A`; abu netral tanpa tint.
- [ ] Hanya satu aksen: Turbo. Maksimal satu CTA Turbo per viewport dan satu blok Turbo penuh per halaman.
- [ ] Heading mengikuti pola Marker Turbo dan memakai ukuran `clamp` besar.
- [ ] Layout asimetris, bukan grid 3 card seragam berikon.
- [ ] Section punya label bernomor dan dipisah hairline.
- [ ] Radius kecil (8/12/16), tanpa pill, tanpa drop shadow.
- [ ] Gambar/mockup nyata; copywriting konkret.
- [ ] Responsif, tanpa horizontal overflow; body ≥ 16px.
- [ ] Input ber-label, fokus terlihat, target sentuh ≥ 44px, `prefers-reduced-motion` dihormati.
- [ ] Komponen existing sudah dicek sebelum membuat yang baru.

---

## 🏆 Golden Rule

```text
HITAM. SATU KUNING. TIPOGRAFI BESAR. GARIS TIPIS.
Kalau terlihat seperti template AI, ulangi dari awal.
```