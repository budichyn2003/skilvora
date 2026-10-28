# Security Scanning — Maincore

Seluruh tooling keamanan Maincore (config + cara baca laporannya).

## 1. Apa yang dijalankan otomatis

| Layer              | Alat              | Trigger                    |
| ------------------ | ----------------- | -------------------------- |
| Secret detection   | Gitleaks          | PR/push + schedule mingguan|
| Dependency CVE     | `pnpm audit`      | PR/push + schedule mingguan|
| Vulnerability & misconfig (fs) | Trivy | PR/push + schedule mingguan|
| Docker image CVE   | Trivy             | PR/push + schedule mingguan|

Semua workflow ada di `.github/workflows/security.yml`,
hasilnya muncul di tab **Security → Code scanning**.

## 2. Menjalankan scan lokal (opsional)

### Gitleaks

```powershell
# butuh binary: winget install gitleaks  (atau brew install gitleaks)
gitleaks git --verbose .
# scan history lengkap
gitleaks git --full-history --verbose .
```

Config allowlist real credentials: `gitleaks.toml` (repo root).
Menolerensi `.env.example`, `README.md`, pemisah `----`
(placeholder), **bukan** file `.env` asli.

### Trivy

```powershell
# butuh binary: winget install aquasecurity.trivy
trivy fs --scanners vuln,secret,config --severity HIGH,CRITICAL .
# Docker image
docker build -t stackplus-api:local -f apps/api/Dockerfile .
trivy image --severity HIGH,CRITICAL stackplus-api:local
```

## 3. Menangani temuan

| Temuan                     | Aksi                                                     |
| -------------------------- | -------------------------------------------------------- |
| Kredensial terdeteksi      | **Rotasi kredensial**, hapus dari repo (jangan hanya mask); update `.gitignore` |
| CVE dependensi prod        | `pnpm update --latest <pkg>` bila fix tersedia, cek kembali security.yml |
| CVE Trivy (fs)             | patch dependency (`pnpm update`), cek advisories         |
| CVE Trivy (image)          | upgrade base image `Dockerfile` ke tag yang lebih baru    |
| Misconfig Trivy            | perbaiki config Dockerfile/infra sesuai rekomendasi scan  |

Maincore minimum: tidak ada kredensial nyata di repo. Level severitas
`HIGH` dan `CRITICAL` untuk dependency/image disarankan segera dibereskan
agar tidak jadi debt.

## 4. Menambah tool scanning baru

Kalau mau menambah (misal Snyk, Semgrep, CodeQL):

1. Cek dulu apakah tool yang sudah ada (Gitleaks + Trivy + `pnpm audit`)
   tidak sudah mencakup kebutuhan yang sama — hindari duplikasi.
2. Dokumentasikan alasan penambahan (temuan yang tidak tercover) di file ini.
3. Tambah job baru di `security.yml`, dengan trigger manual/schedule
   (**jangan** blocking PR kalau tool false positive-nya banyak).
4. Kalau tool butuh API key (contoh Snyk), simpan via GitHub Secrets,
   jangan pernah commit token-nya.
