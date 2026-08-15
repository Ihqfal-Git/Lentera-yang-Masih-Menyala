# Asset Directory Structure & Guidelines

Semua aset media untuk proyek **"Di Antara Jeda dan Aksara"** bersifat modular dan dapat langsung diletakkan pada folder masing-masing di bawah ini:

## 1. Foto Kenangan (`/src/assets/memories/` atau `/public/assets/memories/`)
> **Catatan Penting:** Foto yang digunakan adalah **foto solo pasangan** (bukan foto bersama).

Format yang disarankan: `.webp` atau `.avif` (resolusi optimal: 1080x1350 atau aspek rasio 4:5 / 3:4).

- `photo-01.webp` — Foto kenangan 1
- `photo-02.webp` — Foto kenangan 2
- `photo-03.webp` — Foto kenangan 3
- `placeholder.webp` — Gambar default fallback

## 2. Musik & Audio (`/src/assets/audio/` atau `/public/assets/audio/`)
Format: `.mp3` (disarankan bitrate 128kbps - 192kbps untuk web loading cepat).

- `ambient-dusk.mp3` — Ambient soundscape senja / angin lembut (Phase 1 & Background)
- `senja-teduh-pelita.mp3` — Maliq & D'Essentials (Ending 1: "MARI KITA BICARA")
- `bunga-tidur.mp3` — Nadin Amizah (Ending 2: "BERI AKU WAKTU")
- `perpisahan-termanis.mp3` — Lovarian / Perpisahan Termanis (Ending 3: "BIARKAN KITA BERAKHIR")

## 3. Karakter & Vektor SVG (`/src/assets/svg/`)
- `butterfly.svg` (opsional jika ingin menggunakan file eksternal selain inline component)
- `flower.svg`
- `envelope.svg`
