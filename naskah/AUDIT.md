# Audit video Modul 6 — sebelum polish akhir

Metode: still awal/tengah/akhir tiap adegan + 3 still di tiap transisi (`scripts/qa-audit.mjs`),
pemeriksa penanda kata (`scripts/check-cues.ts`), Whisper small + medium untuk 149 baris narasi.

## A. Akurasi & sinkron
1. Bab 04 — tingkat n = 3 muncul saat "tiga belas" (wordOf mengambil kata pertama). **Diperbaiki** (wordOf kemunculan ke-n).
2. Bab 10 — garis 410 nm menyala saat "delapan puluh enam". **Diperbaiki.**
3. Bab 08 — 1s tampak hampir sebesar 2s; ukuran awan kini memakai skala px/a yang sama.
4. Bab 03 — label suku sentrifugal kini "∝ ℓ(ℓ+1)/r²".
5. Angka lain sudah cocok dengan Modul 6 (Eₙ, a₀, Balmer, Lyman, batas deret, Δℓ, simpul, P(r<a), ⟨r⟩, 1312 kJ/mol, He⁺, R, geser D).

## B. Struktur
6. Bagian 3 hanya ±11 % durasi → ditambah Bab 16 "Jam atom maser hidrogen" (garis 21 cm, Galileo).

## C. Rumus & tata letak
7. Kartu rumus < 48 px dan memakai garis miring; beberapa tampil bersamaan → komponen `Formula`/`Frac` (≥ 56 px, pecahan bertumpuk, satu rumus per momen).
8. Tabrakan: Bab 01 (label translasi vs kartu μ), Bab 15 ("intensitas" vs spektrometer), Bab 06 (kartu R₁ₛ di sumbu).
9. Rujukan penutup dilengkapi.

## D. Kejelasan
10–15. Pembuka→atom hanya crossfade; Balmer tak terlihat; "bukan lintasan" hanya silang; fit statis; batang massa statis; awal beberapa adegan kosong.

## Pengucapan (Whisper medium)
Istilah terucap benar (Coulomb, Rydberg, Laguerre, Lyman, Paschen, deuterium, dipol listrik, He plus).
`radial-06`: "simpul" terdengar "simpel" → rekaman dibuat ulang.
