# Kuis Belajar Anak - SD

Game kuis interaktif untuk anak, dibuat dengan Next.js (App Router) + TypeScript + Tailwind CSS, dijalankan dengan **Bun**.

## Fitur

- Soal pilihan ganda dengan urutan soal **acak** dan urutan jawaban **acak** setiap kali main.
- Pilihan jumlah soal per sesi (5, 10, atau semua).
- Beberapa soal dilengkapi gambar dari sumber eksternal (Wikimedia Commons).
- Skor, progress bar, dan feedback penjelasan setelah menjawab.
- Struktur data per "Bab" yang mudah ditambah materi baru.

## Menjalankan secara lokal

Pastikan [Bun](https://bun.sh) sudah terpasang, lalu jalankan:

```bash
bun install
bun run dev
```

Buka http://localhost:3000

## Build production

```bash
bun run build
bun run start
```

## Deploy ke Vercel

1. Push folder ini ke sebuah repo GitHub/GitLab/Bitbucket.
2. Buka https://vercel.com/new, import repo tersebut.
3. Vercel otomatis mendeteksi Next.js. Set "Install Command" ke `bun install` dan "Build Command" ke `bun run build` jika tidak terdeteksi otomatis (biasanya otomatis terdeteksi dari `bun.lock`).
4. Klik Deploy.

Atau via CLI:

```bash
npm i -g vercel
vercel
```

## Menambah materi/bab baru

Struktur soal berada di `src/data/chapters/`. Setiap bab adalah satu file, contoh: `bab-1-karya-seni-rupa.ts`.

Langkah menambah bab baru:

1. Buat file baru, misal `src/data/chapters/bab-2-nama-bab.ts`, ikuti pola di `bab-1-karya-seni-rupa.ts`:

   ```ts
   import type { QuizChapter } from "@/types/quiz";

   const chapter: QuizChapter = {
     id: "bab-2-nama-bab",
     title: "Bab 2: Judul Bab",
     subtitle: "Deskripsi singkat",
     emoji: "🎭",
     gradient: "from-blue-400 via-cyan-300 to-teal-300",
     questions: [
       {
         id: "b2-01",
         question: "Pertanyaan...",
         image: "https://...", // opsional
         imageAlt: "Deskripsi gambar", // opsional
         options: [
           { id: "a", text: "Jawaban A" },
           { id: "b", text: "Jawaban B" },
           { id: "c", text: "Jawaban C" },
           { id: "d", text: "Jawaban D" },
         ],
         correctOptionId: "a",
         explanation: "Penjelasan singkat setelah dijawab.",
       },
       // ...soal lainnya
     ],
   };

   export default chapter;
   ```

2. Daftarkan di `src/data/chapters/index.ts`:

   ```ts
   import bab2 from "./bab-2-nama-bab";
   export const chapters: QuizChapter[] = [bab1, bab2];
   ```

3. Bab baru otomatis muncul di halaman utama sebagai kartu baru, lengkap dengan pengacakan soal & jawaban.

## Struktur proyek

```
src/
  app/
    page.tsx                 -> halaman utama (pilih bab)
    quiz/[chapterId]/page.tsx -> halaman kuis per bab
  components/
    QuizGame.tsx    -> logika game & pengacakan
    QuestionCard.tsx -> tampilan satu soal
    ResultScreen.tsx -> tampilan skor akhir
  data/chapters/    -> semua soal, dikelompokkan per bab
  lib/shuffle.ts    -> util pengacakan (Fisher-Yates)
  types/quiz.ts     -> tipe data soal & bab
```
