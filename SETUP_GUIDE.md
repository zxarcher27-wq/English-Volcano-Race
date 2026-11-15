# 🌋 Volcano Race - Setup Guide (Biaya Rp 0)

## Langkah 1: Buat Akun (Semua Gratis)

### 1.1 GitHub (untuk simpan kode)
1. Buka https://github.com
2. Klik "Sign Up"
3. Daftar dengan email

### 1.2 Supabase (database & auth)
1. Buka https://supabase.com
2. Klik "Start your project"
3. Login dengan akun GitHub
4. Klik "New Project"
5. Isi:
   - Name: `volcano-race`
   - Password: (buat password database)
   - Region: Southeast Asia (Singapore)
6. Tunggu project dibuat (~2 menit)
7. Salin:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Google AI Studio (Gemini API)
1. Buka https://aistudio.google.com
2. Login dengan Google account
3. Klik "Get API key" → "Create API key"
4. Salin API key → `GEMINI_API_KEY`

### 1.4 Vercel (hosting)
1. Buka https://vercel.com
2. Klik "Sign Up"
3. Login dengan akun GitHub

## Langkah 2: Setup Database

1. Di Supabase Dashboard, buka **SQL Editor**
2. Buka file `src/lib/database.sql` dari project ini
3. Copy-paste seluruh isi file
4. Klik **Run**
5. Pastikan semua tabel terbuat (cek di Table Editor)

## Langkah 3: Upload Kode ke GitHub

```bash
# Di terminal/command prompt
cd volcano-race
git init
git add .
git commit -m "Initial: Volcano Race app"
git branch -M main
git remote add origin https://github.com/USERNAME/volcano-race.git
git push -u origin main
```

## Langkah 4: Deploy ke Vercel

1. Buka https://vercel.com/new
2. Import dari GitHub → pilih repo `volcano-race`
3. Di **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = (dari Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (dari Supabase)
   - `SUPABASE_SERVICE_ROLE_KEY` = (dari Supabase)
   - `GEMINI_API_KEY` = (dari Google AI Studio)
4. Klik **Deploy**
5. Tunggu ~3 menit
6. Website live di: `https://volcano-race.vercel.app`

## Langkah 5: Test

1. Buka website Anda
2. Register sebagai Teacher
3. Upload file materi (PDF/DOCX/TXT)
4. Klik "Analyze Materials with AI"
5. Review quiz yang digenerate
6. Approve & buat Room
7. Buka tab baru → Join Game dengan kode room

## Struktur Biaya: Rp 0

| Layanan | Free Tier |
|---------|-----------|
| Vercel | 100GB bandwidth/bulan |
| Supabase | 500MB database, 1GB storage |
| Gemini API | 15 request/menit, 1500/hari |
| GitHub | Unlimited repos |

Cukup untuk ~30 siswa bermain setiap hari.

## Troubleshooting

**Q: AI analysis gagal?**
A: Cek GEMINI_API_KEY sudah benar. Pastikan file tidak terlalu besar (max 10MB).

**Q: Login tidak bisa?**
A: Pastikan database.sql sudah dijalankan di Supabase SQL Editor.

**Q: Deploy error?**
A: Cek semua Environment Variables sudah terisi di Vercel.
