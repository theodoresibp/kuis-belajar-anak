# Adventure Mode — Audit Kondisi Saat Ini & Rencana Upgrade Bertahap

Tanggal audit: 13 November 2026
Basis: branch `main` @ `e138ce4` (Merge PR #2 `feature/adventure-monster-encounters`,
feat `e8854fb` "add Enchanted Forest adventure mode")
Status baseline terverifikasi di clone audit: **`bun run lint` ✅ · `bun run test` 38/38 ✅ · `bun run build` ✅**

Dokumen ini adalah hasil langkah 1–4 dari cara kerja yang diminta (pelajari repo → audit →
rancangan arsitektur → rencana aset). **Belum ada kode yang diubah.** Implementasi mulai
dari Sprint A setelah dokumen ini disetujui.

---

## 1. Audit kondisi saat ini

### 1.1 Yang sudah baik (dipertahankan, tidak ditulis ulang)

| Bagian | Kondisi |
|---|---|
| `src/features/adventure/adventure.reducer.ts` (123 baris) | Reducer kecil dan bersih: HP hero persisten antar-encounter, HP monster reset per encounter, shield memblokir hazard & boss attack, heart +15 (cap 100), boss attack −15, hazard −10. 11 unit test lolos. **Tidak perlu reducer baru.** |
| `src/components/adventure/AdventureGameCanvas.tsx` (322 baris) | Kontrol sentuh di dalam scene (kiri/kanan di kiri, lompat di kanan), multi-pointer dengan pointer capture, HUD kompak di dalam canvas (HP, skor, progres monster, tombol suara). Sesuai target tablet. |
| Integrasi chapter & jumlah soal | `QuizGame.tsx` → link `/adventure/[chapterId]?count=N&hero=ID`; `page.tsx` memvalidasi count & hero (`rara/bimo/tari`). Hero tampil dengan nama **Velo / Theo / Sera** dari `battle.config.ts`. |
| Battle popup | Popup soal memakai ulang `BattleStage` + `QuestionCard` dari mode battle; ada warning boss, animasi attack/hurt/defeat, damage number lewat `DamageEvent`. |
| Cleanup Phaser | Listener `game.events` dan timer dibersihkan saat SHUTDOWN/DESTROY; audio context ditutup. |
| Quiz Mode | Tidak disentuh Adventure Mode kecuali satu link di `QuizGame.tsx`. Aman. |

### 2.2 Masalah utama yang ditemukan (sesuai prioritas prompt)

**A. Jumlah encounter hardcoded = 3 (prioritas utama)**
- `AdventureScene.ts:14-18` — `ENCOUNTERS` hanya 3 entri (Slime Hutan normal, Rubah Penjaga elite, Penjaga Hutan boss).
- `AdventureScene` constructor: `encounterCount` di-clamp `1..ENCOUNTERS.length` → maksimal 3 selamanya.
- `AdventureMode.tsx:22` — `ENCOUNTER_NAMES` duplikat hardcoded 3 nama; `encounterCount = min(3, questions.length)`.
- Distribusi soal sekarang **dibagi rata ke 3 encounter** (40 soal → 14/13/13), bukan 5 per monster + 10 boss.
- Posisi monster hardcoded `[760, 1510, 2320]`, `worldWidth` tetap 2600, hazard `[480,1260,2040]`, pickup hanya 3 titik tetap (`heart, shield, heart`).
- Boss diasumsikan selalu **index 2**: `encounterSprites[2]`, `activeEncounterId === "forest-guardian"`, `monsterPoseKeys[2]`. Ini akan pecah begitu jumlah encounter dinamis.
- `AdventureMode` memetakan encounter → monster BattleStage dengan rantai ternary berdasarkan id string (`forest-slime ? slime : forest-fox ? fox : purple-dragon`) dan teks boss popup hardcoded "PENJAGA HUTAN".

**B. Dunia masih bentuk geometris dasar**
- Semua background digambar prosedural dengan `Phaser.GameObjects.Graphics`: langit gradasi 2 warna, bukit = elips berulang tiap 420px, awan = pola lingkaran **identik** tiap 520px, pohon = **1 desain** (batang persegi + 3 lingkaran daun) diulang tiap 260px.
- Parallax sebenarnya sudah ada sebagian (`scrollFactor` langit 0, awan 0.12, bukit 0.2, pohon 0.72) — kerangkanya bisa dipakai, isinya yang perlu diganti/diperkaya.
- Platform = satu tekstur generated 180×28 (tanah cokelat + strip rumput) ditile; tidak ada variasi kayu/batu, tidak ada detail sisi tanah/akar/batu.
- Dekorasi yang sudah ada: kunang-kunang (18 titik beranimasi tween) dan segitiga rumput di tanah. Belum ada semak, bunga, jamur, kupu-kupu, partikel jalan.
- Fallback monster & hero digambar sebagai bentuk geometris (rounded rect + lingkaran) di `createMonsterTexture`/`createHeroFrame` — hanya tampil bila aset WebP gagal dimuat.
- `createAnimations()` (animasi hero-idle/walk/jump) **didefinisikan tapi tidak pernah dipanggil** — kode mati. Gerakan hero saat ini memakai pose idle statis + tilt badan.

**C. Aset monster terbatas dan bukan spritesheet**
- Hanya 3 monster × 4 pose (`idle/attack/hurt/defeat`) sebagai gambar WebP pose tunggal 480×480 di `public/assets/gamification/monsters/{slime,fox,purple-dragon}/`. Adventure memakai ulang aset Battle Mode ini; tidak ada folder aset khusus adventure.
- Guardian/boss memakai folder `purple-dragon` tetapi dinamai "Penjaga Hutan" di adventure.
- Hero: 3 hero × 5 pose, gambar tunggal (bukan spritesheet beranimasi frame). Konsekuensi: animasi "berjalan/melompat" frame-by-frame tidak mungkin tanpa aset baru; saat ini diakali dengan tilt.

**D. Power-up minim variasi visual**
- Hanya heart & shield, tekstur digambar Graphics (44×44), ukuran tampil 36px — kecil untuk tablet, tanpa glow/aura/partikel ambil (hanya suara + floating tween yang sudah ada).

### 1.3 Yang tidak akan diubah

- `battle.reducer.ts`, `battle.utils.ts`, `dialogue.ts`, `sound.ts` (dipakai Quiz Battle Mode).
- Nama & identitas **Velo, Theo, Sera** (id internal `rara/bimo/tari` tetap).
- Alur `count` & `hero` dari halaman kuis; sistem nyawa per soal di Quiz Mode.
- Reducer adventure yang ada — hanya **diperluas** bila perlu (lihat §3.3), tidak diganti.

---

## 2. Desain sistem encounter dinamis (Sprint C — prioritas utama)

### 2.1 Fungsi murni yang diusulkan

```ts
// src/features/adventure/encounter-generator.ts
export interface EncounterGeneratorConfig {
  questionsPerMonster: number;   // default 5
  bossQuestions: number;         // default 10
  smallRunBossQuestions: number; // default 5  (total 10–19 soal)
  elitePattern: MonsterTier[];   // default ["normal","normal","elite","normal","elite"] berulang
  miniBossMinEncounters: number; // default 8
  seed: string;                  // chapterId + questionCount → deterministik, aman SSR
}

export function generateEncounterPlan(
  questionCount: number,
  monsterPool: MonsterDefinition[],
  config?: Partial<EncounterGeneratorConfig>,
): EncounterDefinition[]
```

Sifat wajib: **deterministik** (seed dari `chapterId`, tanpa `Math.random()` saat render —
pola yang sama seperti pemilihan soal saat ini yang sengaja dibuat identik server/client),
total soal selalu persis `questionCount`, tidak ada encounter 0 soal, boss selalu terakhir,
monster yang sama tidak muncul dalam 2 encounter berurutan (rotasi shuffle-bag per tier).

### 2.2 Aturan pembagian soal yang diusulkan

1. `n >= 20`: boss = 10 soal. Sisa dibagi ke encounter normal/elite, target 5 per encounter
   (`count = ceil(sisa/5)`), selisih antar-encounter maksimal 1 soal.
2. `10 <= n < 20` (adaptif): boss = 5 soal, sisa seperti di atas.
3. `n < 10` (adaptif): satu encounter final boss saja berisi seluruh soal — perjalanan pendek
   tetap berakhir di boss, tidak ada encounter kosong.
4. Tier non-boss mengikuti pola berulang **[normal, normal, elite, normal, elite]** —
   pola ini menghasilkan persis contoh 40 soal dari prompt.
5. Bila jumlah encounter non-boss >= 8, encounter non-boss di tengah perjalanan
   (yang slot-nya normal) dinaikkan menjadi **mini-boss** (tetap 5 soal, HP & serangan khusus).

### 2.3 Hasil aturan di atas untuk semua kasus uji yang diminta

| Soal | Encounter non-boss | Final Boss | Total encounter | Komposisi tier |
|---:|---|---:|---:|---|
| 5 | — | 5 | 1 | 1 final boss |
| 10 | 1 × 5 | 5 | 2 | 1 normal, 1 boss |
| 20 | 2 × 5 | 10 | 3 | 2 normal, 1 boss |
| 30 | 4 × 5 | 10 | 5 | 3 normal, 1 elite, 1 boss |
| **40** | **6 × 5** | **10** | **7** | **4 normal, 2 elite, 1 boss — persis contoh prompt (N,N,E,N,E,N + boss)** |
| 50 | 8 × 5 | 10 | 9 | 5 normal, 3 elite, 1 boss |
| 75 | 13 × 5 | 10 | 14 | 7 normal, 5 elite, 1 mini-boss, 1 boss |
| 100 | 18 × 5 | 10 | 19 | 10 normal, 7 elite, 1 mini-boss, 1 boss |

Kasus tidak rata (mis. 42 soal): sisa 32 → 7 encounter (5,5,5,5,4,4,4) + boss 10 = 42. Tetap
seimbang, tidak ada soal ganda/hilang — dijamin oleh konstruksi dan diverifikasi unit test
untuk semua n dari 1..120 (property test: total, boss terakhir, tanpa encounter kosong).

### 2.4 HP & damage per tier (tanpa merusak keadilan yang ada)

Pola yang sudah berjalan dipertahankan: damage jawaban benar = `monsterMaxHp / soalDiEncounter`,
dan soal terakhir encounter mengambil sisa HP (jaminan monster kalah tepat di soal terakhir).
Yang diusulkan: `monsterMaxHp` menjadi data dari plan — normal 100, elite 125, mini-boss 150,
final boss 200 — sehingga elite/boss benar-benar terasa lebih kuat, sementara jumlah soal per
encounter tetap penentu kalahnya. Ini memerlukan satu perluasan kecil di reducer:
action `NEXT_ENCOUNTER` menerima `monsterMaxHp` (atau action baru `START_RUN` berisi plan
ringkas). **Bukan reducer baru.** Damage hero tetap: salah −5, boss attack −15 (boss attack
cycle digeneralisasi: berlaku untuk tier final-boss, dan mini-boss dengan interval lebih lambat;
tidak lagi terikat sprite index 2 / id `forest-guardian`).

---

## 3. Rancangan arsitektur modular

Prinsip: `AdventureScene.ts` (983 baris) dipecah per tanggung jawab; semua logic murni
berada di `src/features/adventure/` agar bisa di-unit-test tanpa Phaser.

### 3.1 File baru

| File | Isi |
|---|---|
| `src/features/adventure/monsters.config.ts` | `MonsterDefinition` (id, nama, tier, hp, damage, abilities, assetPath 4 pose, displaySize) + pool 10 monster Enchanted Forest. Terpisah dari `battle.config.ts` agar monster adventure **tidak mengubah** pemilih monster Quiz Battle. |
| `src/features/adventure/encounter-generator.ts` | `generateEncounterPlan()` murni + deterministik (§2). |
| `src/features/adventure/encounter-generator.test.ts` | Test 5/10/20/30/40/50/75/100 + property test 1..120 + boss terakhir + tanpa pengulangan berurutan. |
| `src/features/adventure/level-layout.ts` | Fungsi murni: dari plan → posisi monster, platform, hazard, pickup, `worldWidth`. Aturan keterjangkauan terukur: jarak vertikal antar-platform <= 180px (lompat maks ~216px), pickup tidak dalam radius hazard/monster, pickup selalu di atas platform/tanah. |
| `src/features/adventure/level-layout.test.ts` | Test aturan penempatan untuk plan 1..19 encounter. |
| `src/features/adventure/powerups.config.ts` | Definisi power-up (heart, shield + kandidat baru) & aturan spawn. |
| `src/game/adventure/EnvironmentFactory.ts` | Layer parallax, varian pohon, dekorasi, tileset tanah, animasi lingkungan (daun/rumput/kunang-kunang/kupu-kupu), dengan batas jumlah objek & cleanup. |
| `src/game/adventure/PowerUpSpawner.ts` | Membuat & menganimasikan pickup dari layout, glow + partikel ambil. |
| `src/game/adventure/MonsterActor.ts` | Loading tekstur per monster dari definisi, entrance/hurt/defeat, siklus serangan boss/mini-boss berbasis tier (bukan index). |

### 3.2 File yang diubah

| File | Perubahan |
|---|---|
| `src/game/adventure/AdventureScene.ts` | Constructor menerima **plan + heroId** (bukan `encounterCount` yang di-clamp 3). World dibangun dari `level-layout`; background didelegasikan ke `EnvironmentFactory`; encounter dibuat dari plan lewat `MonsterActor`. Target akhir ±450 baris (orkestrasi saja). |
| `src/components/adventure/AdventureMode.tsx` | Hapus `ENCOUNTER_NAMES` & pembagian rata manual; hitung plan sekali dengan `useMemo` (seed = chapter.id). `monsterId` untuk BattleStage diambil dari plan, bukan ternary id. Teks boss memakai nama monster dari plan. `monsterMaxHp` diteruskan ke reducer. |
| `src/components/adventure/AdventureGameCanvas.tsx` | Props `encounterCount` → `plan` (atau `plan` + count turunan). Sisanya (kontrol/HUD) tidak berubah. |
| `src/features/adventure/adventure.reducer.ts` | Perluasan minimal: `monsterMaxHp` di state; `NEXT_ENCOUNTER` menerima maxHp encounter berikutnya. Action lama tetap. |
| `src/features/adventure/adventure.reducer.test.ts` | Test tambahan: maxHp per tier, HP hero konsisten antar encounter dinamis. |
| `src/features/gamification/battle.config.ts` | **Tidak diubah** di Sprint A–C. (Opsi Sprint D: sinkronkan nama bila pool adventure ingin tampil juga di BattleStage — BattleStage hanya butuh pose set + nama, dipasok dari `monsters.config.ts` adventure.) |

### 3.3 Alur data baru

```
QuizGame (count, hero) → /adventure/[chapterId]?count&hero
  → AdventureMode: generateEncounterPlan(count, ADVENTURE_MONSTERS, seed=chapterId)
  → AdventureGameCanvas(plan) → new AdventureScene(plan, heroId)
  → Scene: layout = generateLevelLayout(plan) → EnvironmentFactory + MonsterActor[]
  → event "monster-encounter" membawa EncounterDefinition (termasuk monsterId & tier)
  → Battle popup memakai definisi monster dari plan; reducer menerima monsterMaxHp per encounter
```

---

## 4. Rencana aset — Sprint A (Art Direction & Asset Foundation)

### 4.1 Gaya visual yang dikunci untuk semua aset baru

2D cartoon fantasy platformer: outline bersih, warna vibrant tapi tidak gelap, siluet jelas,
konsisten dengan pose hero/monster WebP yang sudah ada (chibi, 480×480, background transparan).
Palet hutan: hijau daun #3F9658–#65A30D, tanah #754523, langit biru→lime seperti gradasi saat ini.

### 4.2 Daftar aset yang dibutuhkan

**A. Monster baru (Sprint D, konsep di Sprint A)** — 7 monster menambah 3 yang ada menjadi 10:

| # | Monster | Tier | Catatan |
|---:|---|---|---|
| 1 | Slime Hutan | normal | **Sudah ada** (aset `slime`) |
| 2 | Mushroom Goblin | normal | Baru — jamur berjalan |
| 3 | Thorn Beetle | normal | Baru — kumbang berduri |
| 4 | Leaf Sprite | normal | Baru — peri daun kecil |
| 5 | Poison Frog | normal | Baru — katak ungu-hijau |
| 6 | Vine Crawler | normal | Baru — tanaman merambat |
| 7 | Rubah Penjaga Hutan (Forest Fox) | elite | **Sudah ada** (aset `fox`) |
| 8 | Moss Golem | elite | Baru — batu berlumut besar |
| 9 | Crystal Owl | elite | Baru — burung hantu kristal |
| 10 | Naga Ungu | mini-boss | **Sudah ada** (aset `purple-dragon`, naik peran dari "guardian") |
| 11 | Ancient Tree Guardian | final boss | Baru — pohon raksasa berwajah lucu, aset terbesar |

Setiap monster: 4 pose (`idle/attack/hurt/defeat`), PNG/WebP transparan, kanvas 480×480,
anchor kaki konsisten di bottom-center, padding transparan minimal & seragam, ukuran tampil:
normal ±104px, elite ±124px, mini-boss ±150px, final boss ±190px.
Monster baru = 7 × 4 pose = **28 gambar**. Pipeline sama seperti aset lama: generate pose
sheet satu gaya → potong per pose → WebP (skrip pemotong sudah ada dari pekerjaan sebelumnya).

**B. Environment (Sprint B)**
- Layer jauh: siluet pegunungan/bukit (1 gambar transparan tileable horizontal, ±1024×320).
- Layer hutan belakang & tengah: strip pepohonan tileable (2 varian, transparan).
- Pohon satuan transparan: **6 varian** (tinggi besar, daun membulat, berakar, pohon muda,
  berwajah/lubang lucu, berjamur/rambat) untuk foreground & variasi — ditempatkan dari layout, bukan strip.
- Tileset tanah: strip rumput+tana
...[truncated 4471 chars]
---

## 5. Log penyelesaian (Sprint D–G, 2026-11-13)

Atas persetujuan pengguna, Sprint D–G dikerjakan berurutan dalam satu sesi
setelah Sprint C + perbaikan acak-jawaban diterima.

- **Sprint D — Monster Expansion** (`4573fad`): 8 monster baru × 4 pose
  digenerate sebagai sheet 2×2 bermagenta dan dipotong dengan pipeline
  yang sama seperti aset lama (kroma-key, pembersih komponen liar,
  anchor kaki baris 479). Semua `assetStatus` menjadi "ready", generator
  memakai pool penuh, dan popup battle kini menampilkan artwork monster
  adventure yang sebenarnya (termasuk bos Penjaga Pohon Purba — tidak
  lagi placeholder berwarna).
- **Sprint E — Power-up Upgrade** (`644d821`): artwork heart/shield/star
  256×256; pickup tampil 64px + glow berdenyut + burst saat diambil;
  star menjadi penanda progres encounter (melayang di atas monster
  berikutnya, berpindah tiap kemenangan). Kandidat mekanik baru
  (Energy Orb/Speed Berry/Wing Feather) TIDAK dibuat — mekaniknya belum
  pernah disetujui.
- **Sprint F — Battle Visual Polish** (`e3109a0`): reaksi entrance
  monster ("!" + cincin tanah + kilau emas saat hero mendekat), aura
  per tier (elite emas, mini-boss ungu, bos merah), cincin shockwave
  saat monster kalah. Popup battle tidak diubah (sudah punya
  slash/angka damage; artwork aslinya datang dari Sprint D).
- **Sprint G — Tablet & QA final**: regresi Playwright lulus untuk
  5/10/21/50/74 soal (HUD encounter selalu cocok dengan aturan
  generator), Mode Kuis terverifikasi utuh (battle stage + acak jawaban
  versinya sendiri), dialog di viewport tablet 1600×900 @DPR2 tampil
  benar. Sensus tween: ±76 tween berulang di seluruh dunia pada run
  terbesar (14 encounter), ±15 per layar pandang — di dalam anggaran
  STYLE-GUIDE (≤40). FPS tidak diukur dari sandbox QA (Xvfb membatasi
  rAF); verifikasi frame rate di perangkat tetap di Mi Pad 5 pengguna.
  Refactor `MonsterActor` dari rencana awal tidak dilakukan: scene
  sudah plan-driven sejak Sprint C dan aturan master prompt melarang
  restrukturisasi demi fitur visual.

Status: SELURUH sprint A–G selesai di branch
`feature/adventure-visual-upgrade`. Belum merge ke `main` — menunggu
persetujuan pengguna.

### Putaran feedback pengguna (2026-11-13, setelah Sprint G)

- **Velo melayang**: artwork Velo ternyata digambar lebih kecil di
  dalam frame 480×480 (konten idle hanya 360px vs 449px milik
  Theo/Sera), jadi ia tampil ±18% lebih kecil dan terasa mengambang.
  Pose idle/attack/hurt/victory dinormalisasi ke tinggi konten 449px
  (kaki tetap di baris 479) dengan `~/workspace/fix_velo.py`; pose
  exhausted (jongkok) hanya dibersihkan dari sisa potongan asing.
- **Hazard duri**: segitiga merah prosedural diganti artwork semak
  duri (`public/assets/adventure/hazard-thorn.webp`, ditampilkan
  84×56 — versi gambar pertama terlalu halus untuk ukuran sprite,
  versi final memakai sulur tebal + duri besar agar terbaca kecil).
  Tekstur lama tetap jadi fallback.
- **Musik & suara serangan**: engine musik prosedural WebAudio
  (`src/features/adventure/music.ts`) — track explore + battle per
  tier (normal/elite/boss), crossfade di batas bar, mengikuti toggle
  mute yang sama dengan SFX. `sound.ts` ditambah suara serangan
  berlapis noise+sweep (heroAttack/monsterAttack/bossAttack) dan
  AdventureMode kini memainkannya (sebelumnya battle adventure senyap).
