# Adventure Mode — Style Guide (Sprint A)

Acuan visual tunggal untuk semua aset Adventure Mode mulai Sprint B.
Disusun dari gaya aset hero/monster yang sudah ada (chibi WebP 480×480) dan
tiga gambar konsep Sprint A di `docs/adventure-upgrade/concepts/`.

## 1. Arah gaya

- **Genre:** 2D cartoon fantasy platformer untuk anak SD.
- **Sifat:** colorful, vibrant, playful, polished. Tidak gelap, tidak menyeramkan.
  Monster tetap terlihat "nakal/lucu", bukan menakutkan — termasuk boss.
- **Outline:** garis tepi bersih, ketebalan konsisten (±3–5px pada kanvas 480px),
  warna outline cokelat tua/hitam lembut, bukan hitam pekat.
- **Bentuk:** siluet harus terbaca jelas dari jauh di layar tablet. Setiap monster
  wajib punya siluet yang berbeda dari monster lain (cek: perkecil ke 64px,
  masih bisa dibedakan?).
- **Shading:** cell-shading lembut 2 tingkat + 1 highlight. Cahaya selalu dari
  kiri-atas untuk semua aset (karakter, pohon, platform, power-up).

## 2. Palet warna Enchanted Forest

| Peran | Warna | Dipakai untuk |
|---|---|---|
| Langit atas | `#38BDF8` | Gradasi langit (atas) |
| Langit bawah / cahaya | `#D9F99D` | Gradasi langit (bawah) |
| Daun terang | `#65A30D` | Highlight daun, rumput terang |
| Daun utama | `#3F9658` | Kanopi pohon, semak |
| Daun gelap | `#27734A` | Bayangan kanopi, hutan belakang |
| Batang / tanah kayu | `#754523` | Batang pohon, sisi tanah, platform kayu |
| Tanah permukaan | `#4D7C0F`–`#65A30D` | Strip rumput platform |
| Bukit jauh | `#86B96A` / `#6B9E62` | Layer parallax jauh (dibuat lebih pucat dari warna ini saat jadi sprite) |
| Aksen jamur bercahaya | cyan `#67E8F9` | Jamur glow, kunang-kunang aksen |
| Kunang-kunang | `#FEF08A` | Titik cahaya melayang |
| Bahaya (hazard) | merah muda `#FCA5A5` di atas merah tua `#7F1D1D` | Duri — harus tetap terbaca sebagai "berbahaya" tanpa menakutkan |

Aset baru tidak memperkenalkan warna dominan di luar palet ini tanpa dicatat di
dokumen ini terlebih dahulu.

## 3. Aturan sprite karakter & monster

Mengikuti format aset yang sudah terbukti di repo:

- Format file: **WebP**, background **transparan**, kanvas **480×480**.
- 4 pose wajib per monster: `idle`, `attack`, `hurt`, `defeat`
  (hero: 5 pose, tambah `victory` dan `exhausted` — sudah ada, tidak diubah).
- **Anchor kaki konsisten:** titik bawah karakter (telapak kaki) selalu di
  y ≈ 452 dari 480 (±8px) dan x di tengah 240 (±10px) untuk semua pose monster
  yang sama, agar pergantian pose tidak terlihat "melompat".
- Padding transparan minimal & seragam; tidak memotong kepala, kaki, senjata,
  atau bagian tubuh mana pun.
- Ukuran tampil di dalam game (display size Phaser):
  normal ±104px, elite ±124px, mini-boss ±150px, final boss ±190px,
  hero 76×88px (sudah ada).
- Pipeline produksi (sama seperti aset lama): generate pose sheet satu gaya →
  potong per pose → simpan sheet sumber di `docs/gamification-sheets/` →
  ekspor WebP ke folder aset.
- Nama & identitas hero **tidak berubah**: Velo (`rara`), Theo (`bimo`),
  Sera (`tari`). Aset hero tidak dibuat ulang di upgrade ini.

## 4. Aturan background & tileset

- Background **tidak** berupa satu gambar besar. Terdiri dari layer terpisah
  dengan scroll factor berbeda (kerangka parallax yang sudah ada di scene):
  langit (0) → awan (0.12) → bukit (0.2) → hutan belakang (±0.45) → hutan
  tengah (0.72) → dunia utama (1.0) → foreground tipis (1.15, hemat).
- Strip/layer yang harus tileable: sambungan kiri–kanan tidak boleh terlihat
  (pola tidak terpotong di tepi, lebar kelipatan 512px).
- Pohon satuan dibuat sebagai sprite transparan terpisah (6 varian: tinggi
  besar, daun membulat, berakar besar, pohon muda, berwajah/lubang lucu,
  berjamur + rambat) supaya bisa ditempatkan dari data layout, bukan ditempel
  permanen di background.
- Objek dekoratif tidak boleh menutupi jalur jalan/lompat karakter; dekorasi
  foreground hanya di tepi atas/bawah layar.
- Tileset tanah: permukaan rumput + sisi tanah berlapis dalam satu tekstur
  strip; varian platform kayu dan platform batu memakai bahasa visual yang
  sama (lihat konsep environment: platform kayu cokelat, platform batu abu
  berlumut).

## 5. Aturan power-up

- Ukuran tampil **64px** (naik dari 36px) agar mudah dilihat & disentuh di tablet.
- Setiap power-up: warna khas tunggal, glow/aura lembut sewarna, highlight
  glossy, sparkles kecil — mengikuti konsep power-up Sprint A.
- Animasi standar: floating (naik-turun ±8px), pulse glow, partikel bintang
  saat diambil, ikon indikator saat efek aktif (di HUD untuk shield/star).
- Warna khas: Heart pink-merah, Shield biru, Star kuning emas,
  Energy Orb cyan, Berry Petir oranye (Speed Boost, kandidat Sprint E),
  Bulu Sayap putih-hijau (Double Jump, kandidat Sprint E).

## 6. Anggaran performa (Xiaomi Mi Pad 5, landscape)

- Total objek dekoratif beranimasi per layar pandang: ≤ 40 tween aktif.
- Partikel: emitter dibatasi, selalu dibersihkan (`destroy`) setelah selesai;
  tidak ada partikel `repeat: -1` selain kunang-kunang (maks 18, seperti sekarang).
- Tidak menambah timer Phaser tanpa pasangan cleanup di SHUTDOWN.
- Tekstur environment baru: total ≤ ±1,5 MB WebP untuk seluruh set hutan.

## 7. Referensi konsep Sprint A

- `concepts/concept-environment.webp` — komposisi layer, 6 varian pohon,
  platform kayu & batu, tileset tanah berlapis, jamur bercahaya, kupu-kupu.
- `concepts/concept-monsters.webp` — 8 monster baru: Mushroom Goblin,
  Thorn Beetle, Leaf Sprite, Poison Frog, Vine Crawler, Moss Golem,
  Crystal Owl, Ancient Tree Guardian (boss, paling besar).
  Catatan: pada gambar konsep, lengan kanan Tree Guardian sedikit terpotong
  tepi gambar — tidak masalah karena produksi Sprint D dibuat per monster
  dalam sheet tersendiri.
- `concepts/concept-powerups.webp` — Heart, Shield, Star, Energy Orb,
  Berry Petir dengan glow masing-masing.
