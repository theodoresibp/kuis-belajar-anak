# Adventure Mode — Sprint 1

Prototype Phaser 3 terpisah dari alur kuis yang sudah ada.

## Instalasi

Dari root repository:

```bash
bun add phaser@^3.90.0
```

Salin folder `src/` dari paket ini ke folder `src/` repository.

## Menjalankan

```bash
bun run dev
```

Buka:

```text
http://localhost:3000/adventure-preview
```

## Kontrol

- Desktop: `A` / `D` atau tombol panah kiri / kanan untuk bergerak.
- Desktop: `Space` atau panah atas untuk melompat.
- Mobile: tombol arah dan lompat di bawah game.

## Isi Sprint 1

- Phaser dimuat secara dinamis di client, bukan saat SSR.
- Scene Enchanted Forest dengan placeholder scenery dan platform.
- Arcade Physics, gravity, collision, world bounds.
- Kamera mengikuti karakter.
- Tombol kontrol mobile sederhana.
- Tidak mengubah `QuizGame.tsx`, `QuestionCard.tsx`, atau Battle Mode yang ada.

## Batasan prototype

Karakter dan latar masih dibuat dari bentuk grafis placeholder. Pada sprint aset berikutnya,
placeholder akan diganti dengan spritesheet karakter pilihan (Velo, Theo, atau Sera),
tileset hutan, dan animasi berjalan/lompat.
