# 🌌 UI Design System — "Haiti Night" (ui.md)

> Single Source of Truth untuk seluruh UI milikku sendiri.
> Dark-first, berbasis palet **Quantus 2025**: Electric Violet, Turbo, Haiti, Blue Chalk.
> Struktur dokumen mengikuti ui.md StackPlus, tetapi **gaya visual sengaja dibuat berbeda** (lihat bagian 1).

---

## 0. Aturan untuk AI Agent (BACA DULU)

1. Baca dokumen ini sebelum membuat atau mengubah UI apa pun.
2. **Jangan membuat warna, font, radius, shadow, atau animasi baru.** Pakai token di bawah.
3. Background halaman **selalu Haiti** (`--bg`). Tidak ada halaman berlatar terang.
4. Warna dipakai lewat token (`bg-bg`, `bg-surface`, `text-chalk`, `text-violet`, `bg-turbo`, dst.), bukan hex acak.
5. Reuse komponen yang sudah ada sebelum membuat yang baru.
6. Setiap halaman: hierarchy jelas, **satu CTA Turbo per viewport**, mobile-first, tanpa horizontal overflow.
7. Ragu? Cari pola paling mirip di dokumen ini. Jangan menciptakan gaya baru.

---

## 1. Visual Identity

Karakter: **gelap, berani, elektrik, modern, tegas tapi tetap ramah.**

Rumus visual:

```text
Haiti (ungu-hitam pekat) sebagai latar
+ Surface bertingkat (makin terang = makin "naik")
+ Electric Violet = struktur & interaksi
+ Turbo (kuning) = sorotan & aksi utama, dipakai hemat
+ Blue Chalk = teks utama
+ Card tinggi dengan sudut besar
+ Elevasi lewat border + glow, bukan drop shadow
```

Pembeda dari StackPlus:

| | StackPlus | Milikku |
|---|---|---|
| Tema | Terang hangat | **Gelap Haiti** |
| Aksen | 1 biru | **Violet (struktur) + Turbo (sorotan)** |
| Heading | Dua warna hitam + biru | **Chalk + 1 kata dengan marker Turbo** |
| Tombol | Pill | **Rounded 16px (kotak lembut)** |
| Card | Radius 16–24px, flat | **Radius 28px, tinggi (portrait), glow saat hover** |
| Elevasi | Shadow lembut | **Border + glow violet** |

Prinsip:

- **Gelap tapi tidak hitam murni.** Selalu pakai Haiti dan turunannya, jangan `#000`.
- **Dua aksen, peran jelas.** Violet untuk "ini bisa diklik / sedang aktif". Turbo untuk "lakukan ini sekarang".
- **Turbo itu langka.** Kalau semua kuning, tidak ada yang menonjol.
- **Whitespace lega.** Layout jangan padat.

Prioritas keputusan:

```text
Usability > Readability > Hierarchy > Consistency > Aesthetic
```

---

## 2. Color

### 2.1 Palet inti (dari Quantus 2025)

| Nama | Hex | RGB | Peran |
|---|---|---|---|
| **Haiti** | `#18102B` | 24 16 43 | Background halaman, teks di atas Turbo |
| **Electric Violet** | `#834DFB` | 131 77 251 | Aksen struktur, state aktif, fokus, card sorotan |
| **Turbo** | `#F0E100` | 240 225 0 | CTA utama, kata sorotan, angka kunci |
| **Blue Chalk** | `#F5F3FF` | 245 243 255 | Teks utama di atas gelap |

### 2.2 Token turunan (diturunkan dari Haiti dan Violet)

| Token | Nilai | Fungsi |
|---|---|---|
| `bg` | `#18102B` | Background halaman |
| `surface` | `#1F1638` | Card, panel, sidebar |
| `surface-2` | `#271C45` | Input, baris hover, area tonal |
| `surface-3` | `#31245A` | Card terangkat, dropdown, modal |
| `line` | `#382B5E` | Border default |
| `line-strong` | `#4A3B78` | Border hover / divider tegas |
| `chalk` | `#F5F3FF` | Teks utama, heading |
| `muted` | `#B8B0D4` | Paragraf, deskripsi |
| `subtle` | `#8A80AB` | Meta, placeholder, caption |
| `violet` | `#834DFB` | Tombol sekunder, ikon aktif, ring fokus |
| `violet-hover` | `#9566FF` | Hover violet |
| `violet-press` | `#6B3AE0` | Pressed violet |
| `violet-text` | `#B79CFF` | **Violet untuk teks kecil / link** (violet murni kurang kontras di teks kecil) |
| `violet-soft` | `rgb(131 77 251 / 0.16)` | Latar ikon, badge, item aktif |
| `turbo` | `#F0E100` | CTA utama |
| `turbo-hover` | `#FFF04D` | Hover Turbo |
| `turbo-press` | `#D6C800` | Pressed Turbo |

### 2.3 Semantik

```text
Success: #4ADE80
Warning: #FB923C   (jangan pakai Turbo, supaya tidak tertukar dengan CTA)
Error:   #FF6B7A
Info:    violet-text
```

Latar badge semantik: warna yang sama di opacity 0.14, teks warna penuh.

### 2.4 Kombinasi kontras yang aman

| Teks | Latar | Catatan |
|---|---|---|
| `chalk` | `bg` / `surface` | AAA, aman untuk semua ukuran |
| `muted` | `bg` / `surface` | AA, aman untuk body |
| `subtle` | `bg` | AA tipis; hanya untuk meta, bukan teks penting |
| `bg` (Haiti) | `turbo` | AAA, wajib untuk tombol Turbo |
| `chalk` | `violet` | AA, aman untuk teks ≥ 14px bold atau ≥ 18px |
| `violet` murni | `bg` | **Hanya UI besar / ikon / border**, bukan teks kecil |
| `violet-text` | `bg` | AA, untuk link dan teks aksen kecil |

### 2.5 Aturan warna

- **Turbo**: tombol utama, satu kata sorotan di heading, angka statistik kunci, indikator "baru". Maksimal **satu elemen Turbo dominan per viewport**.
- **Violet**: state aktif, ikon, ring fokus, hover border, glow, card sorotan, tombol sekunder.
- **Blue Chalk** hanya sebagai teks atau tombol terang. Jangan jadikan background section besar.
- Jangan ada gradient warna-warni. Satu-satunya gradient: glow radial violet halus di latar (lihat 6.3).
- Jangan teks Turbo untuk paragraf. Turbo untuk teks hanya di heading besar (kata sorotan).
- Status tidak boleh hanya dibedakan lewat warna; sertakan ikon atau teks.

---

## 3. Typography

**Font: Plus Jakarta Sans** (geometris, hangat, mirip nuansa kartu palet). Satu keluarga untuk semua. Muat via `next/font/google` (atau `@fontsource`) di root layout.

### Skala

| Peran | Ukuran | Weight | Catatan |
|---|---|---|---|
| Display / Hero H1 | `text-5xl lg:text-7xl` | 700 | `leading-[1.05] tracking-tight` |
| Section heading | `text-3xl md:text-5xl` | 700 | `leading-[1.1] tracking-tight` |
| Card title | `text-lg` – `text-2xl` | 600 | |
| Body | `text-base leading-relaxed` | 400 | warna `muted` |
| Body kecil | `text-sm leading-relaxed` | 400 | warna `muted` |
| Eyebrow / label | `text-xs uppercase tracking-[0.14em]` | 600 | warna `violet-text` |
| Button | `text-sm` | 600 | tidak uppercase |
| Meta / caption | `text-xs` | 500 | warna `subtle` |
| Angka besar (stat) | `text-5xl` – `text-6xl` | 700 | `tabular-nums` |

### Pola heading: "Marker Turbo" (WAJIB untuk heading section)

Seluruh heading Blue Chalk. **Satu kata kunci** diberi sorotan Turbo (teks Turbo, atau teks Haiti di atas blok Turbo untuk hero).

```tsx
<h2 className="text-3xl md:text-5xl font-bold text-chalk tracking-tight leading-[1.1]">
  Bangun produk yang <span className="text-turbo">terasa hidup</span>
</h2>
```

Varian hero (marker blok):

```tsx
<span className="bg-turbo text-bg px-3 rounded-xl">hidup</span>
```

Aturan: maksimal 1 frasa (1–3 kata) per heading. Hero boleh memakai varian marker blok; section lain memakai teks Turbo.

---

## 4. Layout & Spacing

### Container

```tsx
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Skala spasi

- Kelipatan 4px (skala Tailwind).
- Jarak antar section: `py-16` mobile → `py-24` desktop → `py-32` untuk hero/CTA.
- Heading → paragraf: `mb-5`; paragraf → CTA: `mb-8`.
- Grid card: `gap-5` mobile, `gap-6` desktop.

### Struktur halaman

- Navbar sticky di atas dengan blur halus, konten diberi `pt-24`.
- Hero: 2 kolom di `lg` (teks kiri, visual kanan), 1 kolom di mobile.
- Konten utama max `max-w-7xl`; teks panjang max `max-w-2xl`.

---

## 5. Radius, Border, Elevasi

### Radius

| Elemen | Radius |
|---|---|
| Button | `rounded-2xl` (16px) |
| Input | `rounded-2xl` (16px) |
| Card | `rounded-[28px]` |
| Card besar / blok CTA / modal | `rounded-[36px]` |
| Badge, tag, avatar | `rounded-full` |
| Ikon dalam kotak | `rounded-xl` (12px) |
| Gambar dalam card | ikut radius card (`overflow-hidden`) |

Hanya badge, tag, dan avatar yang pill penuh. Tombol dan input **bukan** pill.

### Border

- Default: `border border-line` (1px).
- Hover: `border-line-strong`, atau `border-violet/60` untuk elemen interaktif utama.
- Fokus: ring 2px violet (lihat 7.2).
- Jangan border tebal (>1px) kecuali state fokus.

### Elevasi (tanpa drop shadow hitam)

Di latar gelap, shadow hitam tidak terlihat. Elevasi dibuat dari **tingkat surface + border + glow**:

| Level | Tampilan |
|---|---|
| 0 | `bg` |
| 1 | `surface` + `border-line` (card standar) |
| 2 | `surface-2` / `surface-3` + `border-line-strong` (dropdown, modal) |
| Hover | border violet + glow: `shadow-[0_0_0_1px_rgb(131_77_251/0.5),0_20px_48px_-16px_rgb(131_77_251/0.45)]` |
| Card sorotan | `bg-violet` + glow violet lebar |

Glow harus lembut dan lebar, tidak keras.

---

## 6. Latar & Dekorasi

### 6.1 Halaman

`bg-bg text-chalk` pada `<body>`.

### 6.2 Surface

Naik bertahap: `bg` → `surface` → `surface-2` → `surface-3`. Jangan melompat dua tingkat dalam satu komponen.

### 6.3 Glow latar hero

Satu glow radial violet halus di belakang visual hero, opacity rendah:

```tsx
<div className="absolute -z-10 size-[520px] rounded-full bg-violet/25 blur-[120px]" />
```

Maksimal 2 glow per halaman. Tidak ada gradient pelangi.

### 6.4 Pola titik / grid (opsional)

Boleh grid garis sangat tipis (`line` di opacity 40%) di hero atau CTA. Satu per halaman.

---

## 7. Komponen

### 7.1 Button

**Primary (Turbo)**: aksi utama, **satu per viewport**.

```tsx
<button className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-turbo text-bg text-sm font-semibold hover:bg-turbo-hover active:bg-turbo-press active:scale-[0.98] transition-all duration-200">
  Mulai Sekarang
</button>
```

**Secondary (Violet)**: aksi penting kedua.

```tsx
<button className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-violet text-chalk text-sm font-semibold hover:bg-violet-hover active:bg-violet-press transition-all duration-200">
  Lihat Detail
</button>
```

**Ghost (outline)**: aksi tersier.

```tsx
<button className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-line-strong text-chalk text-sm font-semibold hover:bg-surface-2 hover:border-violet/60 transition-all duration-200">
  Batal
</button>
```

**Link aksi**: `text-violet-text text-sm font-semibold` + ikon panah kecil, hover `text-chalk`.

Aturan: tinggi minimal 44px (`h-11` ke atas; default `h-12`). Ikon dan teks dipisah `gap-2`. Tombol disabled: `opacity-40 cursor-not-allowed`. Tombol loading: spinner kecil + teks tetap terlihat.

### 7.2 Input & Form

```tsx
<label className="block text-sm font-semibold text-chalk mb-2" htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  placeholder="nama@email.com"
  className="w-full h-12 rounded-2xl bg-surface-2 border border-line px-4 text-sm text-chalk placeholder:text-subtle
             hover:border-line-strong
             focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/40 transition"
/>
<p className="mt-2 text-xs text-[#FF6B7A]">Pesan error di sini</p>
```

Aturan:
- Setiap input punya `<label>` atau `aria-label`.
- Fokus harus terlihat (ring violet).
- Error: border `#FF6B7A` + teks error + ikon, bukan warna saja.
- Textarea dan select memakai gaya yang sama.
- Checkbox / toggle aktif = `bg-violet`.

### 7.3 Card

**Card standar (portrait, gaya kartu palet):**

```tsx
<div className="group rounded-[28px] bg-surface border border-line p-6 transition duration-300
                hover:-translate-y-1 hover:border-violet/60 hover:shadow-[0_20px_48px_-16px_rgb(131_77_251/0.45)]">
  <div className="size-11 rounded-xl bg-violet-soft text-violet-text grid place-items-center mb-5">{/* ikon */}</div>
  <h3 className="text-xl font-semibold text-chalk mb-2">Judul Card</h3>
  <p className="text-sm text-muted leading-relaxed">Deskripsi singkat 2–3 baris.</p>
  <a className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-violet-text group-hover:text-chalk">Pelajari →</a>
</div>
```

**Card sorotan (violet solid)**: satu per grup.

```tsx
<div className="rounded-[28px] bg-violet text-chalk p-6 shadow-[0_24px_60px_-20px_rgb(131_77_251/0.7)]">
```
Deskripsi `text-chalk/80`, ikon di kotak `bg-chalk/15`.

**Card Turbo (sangat langka)**: maksimal satu di seluruh halaman, untuk penawaran atau promo. `bg-turbo text-bg rounded-[28px]`.

Aturan: maksimal **satu card sorotan per grup**. Grid: 1 kolom mobile, 2 tablet, 3 desktop. Jangan menyalin teks deskripsi antar card.

**Stat card:** angka besar `tabular-nums`, label `text-sm text-muted`. Satu angka kunci boleh Turbo.

**Bento grid:** card berbagai ukuran (1×1, 2×1, 1×2) dalam grid 4 kolom di desktop. Item terbesar boleh card sorotan violet.

### 7.4 Badge, Tag, Eyebrow

- **Eyebrow section**: `text-xs uppercase tracking-[0.14em] font-semibold text-violet-text`, didahului garis pendek atau titik violet.
- **Badge status**: `rounded-full px-3 py-1 text-xs font-semibold`, latar tint + teks warna penuh + titik atau ikon.
- **Badge "Baru"**: `bg-turbo text-bg` (hitung sebagai elemen Turbo).
- **Tag kategori**: `bg-violet-soft text-violet-text rounded-full px-3 py-1 text-xs font-semibold`.

### 7.5 Section Header

```text
[ Eyebrow ]
[ Heading (Chalk + marker Turbo) ]
[ Deskripsi max-w-xl, warna muted ]
```

Rata kiri di desktop; boleh rata tengah untuk section pendek. Satu CTA maksimal di bawah deskripsi.

### 7.6 Navbar

- `sticky top-0 z-50`, latar `bg-bg/80 backdrop-blur-xl border-b border-line`.
- Kiri: logo. Tengah: link `text-sm font-medium text-muted hover:text-chalk`; link aktif `text-chalk` dengan garis bawah violet 2px.
- Kanan: tombol Turbo **atau** secondary (bukan keduanya bersamaan dengan CTA hero di viewport yang sama).
- Mobile: hamburger membuka drawer `bg-surface`; target sentuh ≥ 44px.

### 7.7 Footer

Latar `bg-surface border-t border-line`. Kolom: brand + tagline, Quick Links, Layanan, Kontak. Heading kolom `text-sm font-semibold text-chalk`; link `text-sm text-muted hover:text-chalk`. Baris bawah: copyright `text-xs text-subtle`.

### 7.8 Tabel Data

- Dibungkus `rounded-[28px] bg-surface border border-line overflow-hidden`.
- Header: `bg-surface-2 text-xs uppercase tracking-wider text-subtle`.
- Baris: `border-t border-line hover:bg-surface-2`.
- Aksi per baris: ghost icon button dengan `aria-label`.
- Search/filter di atas tabel memakai input standar.

### 7.9 Modal & Dropdown

- Overlay `bg-bg/70 backdrop-blur-sm`.
- Panel `bg-surface-3 border border-line-strong rounded-[36px] p-8 max-w-lg`.
- Tombol: primary di kanan, ghost "Batal" di kirinya.
- Esc menutup, fokus terkunci dalam modal.

### 7.10 Toast

Latar `surface-3`, border `line-strong`, `rounded-2xl`, teks `text-sm text-chalk`, ikon sesuai semantik. Posisi `top-right`, durasi 3–4 detik. Untuk hasil aksi, bukan pesan permanen.

### 7.11 Icon

- Outline (Lucide), `strokeWidth 2`, `currentColor`.
- 16–20px inline, 20–24px di kotak ikon.
- Ikon aktif `text-violet-text`. Tidak boleh 3D atau emoji sebagai ikon UI.

### 7.12 State umum

- **Loading**: skeleton `bg-surface-2 animate-pulse rounded-2xl`.
- **Empty**: ikon di kotak `bg-violet-soft`, judul, deskripsi, satu tombol primary.
- **Error**: card dengan teks `#FF6B7A` dan tombol "Coba lagi".
- **Disabled**: `opacity-40`.

---

## 8. Motion

| Pakai untuk | Aturan |
|---|---|
| Hover card | `-translate-y-1`, 300ms ease-out |
| Tombol | `transition-all 200ms`, active `scale-[0.98]` |
| Reveal saat scroll | fade + naik 16px, 500ms, sekali saja |
| Glow latar hero | `animate-pulse` pelan, opsional |
| Marquee (opsional) | linear, 30–40s, dalam wrapper `overflow-hidden` |

Aturan:
- Interaksi mikro 200–300ms; transisi besar maks 500ms.
- **Wajib** hormati `prefers-reduced-motion` (matikan translate, reveal, marquee).
- Tidak ada animasi infinite selain glow pulse dan marquee.
- Tidak ada parallax besar, bouncing berlebihan, atau spinning dekoratif.

---

## 9. Urutan Halaman Landing

```text
Navbar
Hero (eyebrow + heading marker Turbo + paragraf + 1 CTA Turbo + visual dengan glow violet)
Logo / bukti sosial
Fitur (card standar, satu sorotan violet)
Bento highlight
Statistik (angka besar, satu Turbo)
Testimoni
CTA block (card besar violet, satu tombol Turbo)
Footer
```

Setiap section diawali eyebrow + heading, diakhiri maksimal satu CTA.

---

## 10. Responsive

Mobile-first: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.

- Hero: 1 kolom → `lg:grid-cols-2`.
- Grid card: 1 → 2 → 3 kolom. Bento menyederhana jadi 1–2 kolom di mobile.
- Heading turun ukuran di mobile (`text-5xl` → `lg:text-7xl`).
- Tidak boleh horizontal overflow.
- Konflik: **usability mobile > dekorasi desktop.** Glow dan blur diperkecil di mobile.

---

## 11. Accessibility

- Ikuti tabel kontras di 2.4. `subtle` jangan dipakai untuk teks penting.
- Violet murni tidak untuk teks kecil; pakai `violet-text`.
- Semua input punya label; tombol ikon punya `aria-label`.
- Gambar punya `alt`; dekoratif `alt=""`.
- Fokus terlihat (ring violet 2px, offset terhadap latar) dan keyboard navigation berfungsi.
- Target sentuh ≥ 44×44px.
- Status tidak hanya lewat warna.
- Hormati `prefers-reduced-motion`.

---

## 12. Do & Don't

**Do**
- Latar Haiti, surface bertingkat, teks Chalk/muted.
- Violet untuk interaksi, Turbo untuk satu aksi utama.
- Heading Chalk + satu marker Turbo.
- Card portrait radius 28px dengan border tipis dan glow saat hover.
- Satu card sorotan per grup, satu CTA Turbo per viewport.

**Don't**
- Jangan `#000` atau putih murni sebagai latar.
- Jangan Turbo di banyak tempat sekaligus.
- Jangan violet murni untuk teks kecil.
- Jangan drop shadow hitam, border tebal, atau gradient pelangi.
- Jangan tombol/input pill (khusus badge dan avatar).
- Jangan font atau warna baru di luar token.
- Jangan menyalin teks dummy antar card.

---

## 13. Setup Teknis (Tailwind v4, CSS-first)

Letakkan di `globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --color-bg: #18102B;
  --color-surface: #1F1638;
  --color-surface-2: #271C45;
  --color-surface-3: #31245A;
  --color-line: #382B5E;
  --color-line-strong: #4A3B78;

  --color-chalk: #F5F3FF;
  --color-muted: #B8B0D4;
  --color-subtle: #8A80AB;

  --color-violet: #834DFB;
  --color-violet-hover: #9566FF;
  --color-violet-press: #6B3AE0;
  --color-violet-text: #B79CFF;
  --color-violet-soft: rgb(131 77 251 / 0.16);

  --color-turbo: #F0E100;
  --color-turbo-hover: #FFF04D;
  --color-turbo-press: #D6C800;

  --font-sans: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
}

html { color-scheme: dark; }

body {
  background: var(--color-bg);
  color: var(--color-chalk);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

::selection { background: var(--color-violet); color: var(--color-chalk); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Font di `layout.tsx`:

```tsx
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

<body className={jakarta.variable}>
```

---

## 14. Checklist Sebelum Commit UI

- [ ] Hanya memakai token dari dokumen ini.
- [ ] Latar halaman = Haiti; tidak ada `#000` atau putih murni sebagai background.
- [ ] Maksimal satu elemen Turbo dominan per viewport.
- [ ] Teks kecil memakai `violet-text`, bukan violet murni.
- [ ] Heading section = Chalk + satu marker Turbo.
- [ ] Tombol/input rounded 16px, card 28px.
- [ ] Hover card = border violet + glow, tanpa drop shadow hitam.
- [ ] Responsif 1/2/3 kolom, tidak ada horizontal overflow.
- [ ] Input punya label, fokus terlihat, target sentuh ≥ 44px.
- [ ] `prefers-reduced-motion` dihormati, tidak ada animasi infinite baru.
- [ ] Komponen existing sudah dicek sebelum membuat yang baru.

---

## 🏆 Golden Rule

```text
JANGAN MEMBUAT STYLE BARU.
Haiti sebagai latar. Violet untuk interaksi. Turbo untuk satu aksi.
Cari pola paling mirip → pakai Existing Token + Existing Component.
```

> **Dark Haiti. Violet menggerakkan. Turbo menyorot. Chalk menjelaskan.**
