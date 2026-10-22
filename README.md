# Atom Hidrogen — video Modul 6 Kimia Kuantum

Film edukasi **Struktur & Spektrum Atom Hidrogen** (Modul 6, S1 Kimia UNESA), dibuat dengan [Remotion](https://remotion.dev).
1920 × 1080 / 2560 × 1440 · 30 FPS · **±18 menit** (estimasi sebelum narasi direkam) · 16 bab + pembuka, judul, peta video, dan penutup.
Mesin video sama dengan repo `Claude-Video-Kimia` (Modul 4): naskah → timeline → subtitle kata-per-kata → musik orisinal.

## Alur

| Bagian | Bab |
|---|---|
| — | Pembuka: tabung hidrogen & prisma → empat garis · Judul · Peta video |
| 1 · Teori dasar | 01 Satu proton, satu elektron (Coulomb, massa tereduksi μ/mₑ ≈ 0,999456) · 02 Memisahkan jarak dan arah (ψ = R·Y, u = rR) · 03 Potensial efektif · 04 Asal kuantisasi (Eₙ = −13,6 Z²/n² eV, degenerasi n²) · 05 Bilangan kuantum · 06 Fungsi radial & simpul (n − ℓ − 1) · 07 Distribusi radial (r* = a, ⟨r⟩ = 1,5a, 32 %) · 08 Orbital s, p, d |
| 2 · Implementasi kimia | 09 Energi ionisasi (13,6 eV, 1312 kJ/mol, He⁺ 54,4 eV, virial) · 10 Deret Lyman/Balmer/Paschen (121,6 · 656 · 486 · 434 · 410 nm, batas 91,2 & 364,7 nm) · 11 Aturan seleksi Δℓ = ±1 (diagram Grotrian) · 12 Energi ionisasi dari data spektrum (R ≈ 109 678,7 cm⁻¹; deuterium bergeser 0,179 nm) · 13 Batas model & tabel periodik |
| 3 · Industri | 14 Lampu deuterium & kalibrasi panjang gelombang (garis D 486,0 & 656,1 nm, farmakope) · 15 ICP-OES, logam berat, plasma etsa, pelebaran garis Balmer |
| — | 16 Rangkuman · Penutup & rujukan |

Daftar bab bertimecode untuk YouTube: `naskah/BAB_YOUTUBE.txt` (diperbarui otomatis setelah narasi direkam).

## Narasi (ElevenLabs, suara Bagas)

1. Pastikan secret **`ELEVENLABS_API_KEY`** ada di repo ini (Settings → Secrets and variables → Actions). Secret repo lain tidak ikut terbawa.
2. Actions → **Buat voice-over ElevenLabs + render 2K** → Run workflow (voice ID bawaan = Bagas, model `eleven_v4`).
3. Workflow membuat MP3 per baris, menyesuaikan timeline & musik, lalu merender **dua versi**:
   - `atom-hidrogen-dengan-narasi-2k-30fps` (narasi + musik pelan + subtitle),
   - `atom-hidrogen-tanpa-narasi-2k-30fps` (musik saja, tanpa subtitle — untuk dubbing sendiri).

Render ulang tanpa membuat suara: Actions → **Render Atom Hidrogen 2K 30FPS** (isi `props` dan `nama`).

## Intro SCIENTIAN

Unggah intro 30 FPS ke `intro/intro.mp4` (lihat `intro/README.md`); render berikutnya otomatis menghasilkan juga `…-dengan-intro.mp4`.

## Mengubah naskah

Edit `src/script.ts`, lalu `npm run timeline && npm run music`. Pratinjau: `npm run dev` (folder *Adegan* berisi tiap adegan).
QA: `node scripts/qa-stills.mjs [id-adegan]` → `out/qa/`.

## Catatan ilmiah

Angka mengikuti Modul 6 (model Coulomb nonrelativistik; λ dalam vakum kecuali garis lampu D₂ yang ditulis di udara seperti di farmakope).
Awan orbital adalah sampel acak |ψ|² (emas = fase +, biru = fase −). Alat (spektrofotometer, ICP, ruang etsa) digambar skematis.
