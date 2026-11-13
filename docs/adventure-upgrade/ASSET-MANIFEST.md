# Adventure Mode — Asset Manifest (Sprint A)

Hasil audit aset per 13 November 2026 terhadap `main` @ `e138ce4`.
Pemakaian diverifikasi dengan pencarian referensi di seluruh `src/`
(referensi statis di `battle.config.ts` + path dinamis di
`AdventureScene.preload()`), sesuai aturan: **tidak ada aset lama yang
dihapus sebelum terbukti tidak dipakai.**

## 1. Aset lama — status pemakaian

### Hero (semua TERPAKAI — jangan diubah/dihapus)

| Aset | Dipakai oleh |
|---|---|
| `public/assets/gamification/hero/hero-*.webp` (5 pose) | Velo (`rara`) via `battle.config.ts`; dimuat juga oleh AdventureScene |
| `public/assets/gamification/hero/bimo/*.webp` (5 pose) | Theo (`bimo`) via `battle.config.ts` + AdventureScene |
| `public/assets/gamification/hero/tari/*.webp` (5 pose) | Sera (`tari`) via `battle.config.ts` + AdventureScene |

### Monster lama (semua TERPAKAI — menjadi 3 dari 11 monster pool adventure)

| Aset | Dipakai oleh | Peran baru (Sprint C/D) |
|---|---|---|
| `monsters/slime/*.webp` (4 pose) | Battle Mode (Slime Daun) + AdventureScene | Slime Hutan — normal |
| `monsters/fox/*.webp` (4 pose) | Battle Mode (Rubah Oranye) + AdventureScene | Rubah Penjaga Hutan — elite |
| `monsters/purple-dragon/*.webp` (4 pose) | Battle Mode (Naga Ungu) + AdventureScene (sebagai "Penjaga Hutan") | Naga Ungu — **mini-boss** (nama di adventure diselaraskan menjadi Naga Ungu) |

### Background battle (dipakai Quiz Battle — di luar cakupan upgrade, tidak diubah)

| Aset | Status |
|---|---|
| `backgrounds/fantasy-arena-day.webp` | Terpakai (arena Naga Ungu) |
| `backgrounds/fantasy-forest-day.webp` | Terpakai (arena Slime Daun) |
| `backgrounds/fantasy-field-day.webp` | Terpakai (arena Rubah Oranye) |
| `backgrounds/fantasy-arena-night.webp` | **Tidak terpakai** — sudah ditandai "spare / unused" di `src/features/gamification/ASSETS.md`. Tetap disimpan (cadangan arena malam), tidak dihapus. |
| `backgrounds/fantasy-castle-dusk.webp` | **Tidak terpakai** — sama seperti di atas. Tetap disimpan. |

### Sheet sumber (`docs/gamification-sheets/`)

Ada 4 sheet: `hero-bimo`, `hero-tari`, `monster-fox`, `monster-slime`.
Sheet sumber untuk hero utama (Velo) dan purple-dragon **tidak tersimpan**
di repo saat ini — dicatat sebagai kekurangan dokumentasi aset lama;
tidak menghalangi upgrade karena file WebP produksinya ada dan terpakai.

### Aset prosedural di AdventureScene (bukan file)

Tekstur yang digambar kode saat runtime — `forest-platform`, `forest-hazard`,
`pickup-heart`, `pickup-shield`, fallback hero/monster geometris.
Status: terpakai sekarang; akan **digantikan bertahap** di Sprint B/E oleh
sprite file, dan kode gambarnya baru dihapus setelah penggantinya terpasang
dan terverifikasi (aturan yang sama: cek dulu, hapus terakhir).

## 2. Aset baru yang dibutuhkan

### Monster baru — 8 monster × 4 pose = 32 file WebP (Sprint D) ✅ SELESAI

Folder tujuan: `public/assets/adventure/monsters/<id>/<pose>.webp`
(id dan path persis seperti `src/features/adventure/monsters.config.ts`).
Semua 32 file sudah dibuat (sheet 2×2 bermagenta → `cut_monsters.py`,
komponen terbesar + anchor kaki di baris 479) dan `assetStatus` kedelapan
monster sudah "ready"; generator kini memakai pool penuh.

| ID | Nama | Tier | Pose |
|---|---|---|---|
| `mushroom-goblin` | Goblin Jamur | normal | idle, attack, hurt, defeat |
| `thorn-beetle` | Kumbang Duri | normal | idle, attack, hurt, defeat |
| `leaf-sprite` | Peri Daun | normal | idle, attack, hurt, defeat |
| `poison-frog` | Katak Giok | normal | idle, attack, hurt, defeat |
| `vine-crawler` | Perayap Rambat | normal | idle, attack, hurt, defeat |
| `moss-golem` | Golem Lumut | elite | idle, attack, hurt, defeat |
| `crystal-owl` | Burung Hantu Kristal | elite | idle, attack, hurt, defeat |
| `tree-guardian` | Penjaga Pohon Purba | final-boss | idle, attack, hurt, defeat |

Spesifikasi per file: lihat STYLE-GUIDE §3 (480×480 transparan, anchor kaki
konsisten). Sheet sumber disimpan di `docs/adventure-upgrade/sheets/`
(`media-generation-sheet-<id>-*.webp`).

### Environment — set Enchanted Forest (Sprint B)

Folder tujuan: `public/assets/adventure/environment/`

| File | Spesifikasi |
|---|---|
| `hills-far.webp` | Siluet bukit/pegunungan, tileable horizontal, ±2048×320, transparan |
| `forest-back.webp` | Strip hutan belakang (pohon kecil), tileable, ±2048×360, transparan |
| `forest-mid.webp` | Strip hutan tengah (pohon sedang), tileable, ±2048×420, transparan |
| `tree-tall.webp`, `tree-round.webp`, `tree-roots.webp`, `tree-young.webp`, `tree-face.webp`, `tree-mushroom.webp` | 6 varian pohon satuan transparan, tinggi ±512px |
| `ground-tile.webp` | Strip tanah: rumput + lapisan tanah + batu/akar, tileable, 512×128 |
| `platform-wood.webp`, `platform-stone.webp` | Platform varian, ujung membulat, 360×56 transparan |
| `decor-bush.webp`, `decor-flowers.webp`, `decor-mushroom-glow.webp`, `decor-rock.webp`, `decor-grass-tuft.webp` | Dekorasi satuan transparan kecil |

Langit & awan tetap digambar prosedural (gradasi + bentuk awan sederhana
yang divariasikan) — murah secara performa dan tidak butuh file.

### Power-up (Sprint E) ✅ SELESAI

Folder tujuan: `public/assets/adventure/powerups/` — `heart.webp`,
`shield.webp`, `star.webp` sudah dibuat (satu sheet → `cut_powerups.py`)
dan dipakai scene: pickup tampil 64px dengan glow berdenyut + burst
saat diambil; star menjadi penanda monster berikutnya. Kandidat mekanik
baru (energy-orb/speed-berry/wing-feather) tetap menunggu persetujuan
mekanik tersendiri.

| File | Status |
|---|---|
| `heart.webp`, `shield.webp` | Desain ulang mengikuti konsep Sprint A, 256×256 transparan |
| `star.webp` | Baru (dipercepat ke Sprint C sebagai penanda progres encounter) |
| `energy-orb.webp`, `speed-berry.webp`, `wing-feather.webp` | Kandidat Sprint E — file dibuat hanya bila mekaniknya disetujui saat Sprint E dimulai |

## 3. Ringkasan Sprint A

- Aset lama terpakai: **32 file** (15 hero, 12 monster, 3 background battle,
  2 background cadangan tidak terpakai tapi disimpan).
- Aset baru direncanakan: **32 file monster + ±18 file environment + 3 file power-up**.
- Tidak ada aset yang dihapus pada Sprint A.
