# SonarCloud Integration Guide

## Overview
Job SonarCloud telah ditambahkan ke dalam CI pipeline untuk melakukan analisis kualitas kode secara otomatis.

## Konfigurasi yang Sudah Diterapkan

### 1. Job SonarCloud di CI Pipeline
- Job `sonarcloud` ditambahkan ke dalam `.github/workflows/ci.yml`
- Bergantung pada job `lint` dan `test` (harus berhasil terlebih dahulu)
- Menggunakan `SonarSource/sonarcloud-github-action@master`

### 2. File Konfigurasi
- `sonar-project.properties` dibuat di direktori `weather-report/`
- Mengatur project key, organization, dan pengaturan Quality Gate

## Langkah Selanjutnya (Diperlukan Setup Manual)

### 1. Setup SonarCloud Account
1. Buka [SonarCloud.io](https://sonarcloud.io)
2. Login dengan akun GitHub Anda
3. Import repository `dhandyjoe/CourseAI_CI-CD`

### 2. Konfigurasi Project di SonarCloud
1. Setelah import, masuk ke project settings
2. Update project key jika berbeda: `dhandyjoe_CourseAI_CI-CD`
3. Pastikan organization name sesuai dengan username GitHub Anda

### 3. Setup Quality Gate (Sesuai Ketentuan)
Di SonarCloud dashboard:
1. Masuk ke **Quality Gates** → **Create**
2. Buat Quality Gate baru dengan nama "Strict Quality Gate"
3. Tambahkan kondisi:
   - **New Bugs**: `is greater than` `0` → **FAIL**
   - **New Code Smells**: `is greater than` `0` → **FAIL**
4. Set sebagai default untuk project Anda

### 4. Setup GitHub Secrets
Di repository GitHub, tambahkan secrets berikut:
1. **Settings** → **Secrets and variables** → **Actions**
2. Tambahkan `SONAR_TOKEN`:
   - Buat token di SonarCloud: **My Account** → **Security** → **Generate Token**
   - Copy token dan tambahkan ke GitHub secrets

## Fitur Implementasi

### Quality Gate Configuration
- ✅ Gagal jika ada **1 bug baru** atau lebih
- ✅ Gagal jika ada **1 code smell baru** atau lebih  
- ✅ Coverage report integration
- ✅ TypeScript support

### CI Integration
- ✅ Runs setelah lint dan test berhasil
- ✅ Fetch full git history untuk analisis yang akurat
- ✅ Otomatis upload coverage dari test results
- ✅ Fail CI jika Quality Gate tidak terpenuhi

## Struktur File yang Ditambahkan
```
.github/workflows/
  ├── ci.yml (updated - menambah job sonarcloud)
weather-report/
  ├── sonar-project.properties (new)
```

## Testing
Setelah setup selesai, setiap push ke branch `master` akan:
1. Menjalankan linting
2. Menjalankan testing  
3. Menjalankan SonarCloud analysis
4. Gagal jika Quality Gate tidak terpenuhi

## Troubleshooting
- Pastikan `SONAR_TOKEN` sudah ditambahkan ke GitHub secrets
- Verifikasi project key di SonarCloud sesuai dengan `sonar-project.properties`
- Cek organization name sesuai dengan username GitHub
