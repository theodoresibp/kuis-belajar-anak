# Kuis Belajar Anak - SD

Game kuis interaktif untuk anak, dibuat dengan Next.js (App Router) + TypeScript + Tailwind CSS, dijalankan dengan **Bun**.

## Fitur

- Halaman **Materi** per bab: rangkuman bacaan yang bisa dipelajari anak sebelum mengerjakan kuis.
- Soal pilihan ganda dengan urutan soal **acak** dan urutan jawaban **acak** setiap kali main.
- Pilihan jumlah soal per sesi (5, 10, atau semua).
- Beberapa soal & materi dilengkapi gambar dari sumber eksternal (Wikimedia Commons) atau aset lokal.
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

## Menambah mata pelajaran baru

Setiap mata pelajaran punya folder sendiri di `src/data/subjects/`, contoh: `seni-budaya/`.

Langkah menambah mata pelajaran baru:

1. Buat folder baru, misal `src/data/subjects/matematika/`.
2. Buat file bab pertama di dalamnya, misal `bab-1-nama-bab.ts`, ikuti pola di bawah (lihat juga bagian "Menambah bab baru").
3. Buat `src/data/subjects/matematika/index.ts`:

   ```ts
   import type { Subject } from "@/types/quiz";
   import bab1 from "./bab-1-nama-bab";

   const subject: Subject = {
     id: "matematika",
     title: "Matematika",
     description: "Berhitung dan bangun datar",
     emoji: "🔢",
     gradient: "from-blue-400 via-cyan-300 to-teal-300",
     chapters: [bab1],
   };

   export default subject;
   ```

4. Daftarkan di `src/data/subjects/index.ts`:

   ```ts
   import matematika from "./matematika";
   export const subjects: Subject[] = [seniBudaya, matematika];
   ```

5. Mata pelajaran baru otomatis muncul sebagai kartu baru di halaman utama.

## Menambah bab baru (dalam satu mata pelajaran)

1. Buat file baru di folder mata pelajarannya, misal `src/data/subjects/seni-budaya/bab-2-nama-bab.ts`, ikuti pola di `bab-1-karya-seni-rupa.ts`:

   ```ts
   import type { QuizChapter } from "@/types/quiz";

   const chapter: QuizChapter = {
     id: "bab-2-nama-bab",
     title: "Bab 2: Judul Bab",
     subtitle: "Deskripsi singkat",
     emoji: "🎭",
     gradient: "from-blue-400 via-cyan-300 to-teal-300",
     material: { // opsional, tapi sangat disarankan
       summary: "Ringkasan singkat isi bab ini.",
       sections: [
         {
           heading: "Judul Bagian",
           emoji: "🎨", // opsional
           paragraphs: ["Paragraf penjelasan..."], // opsional
           bullets: ["Poin singkat 1", "Poin singkat 2"], // opsional
           image: "https://...", // opsional
           imageAlt: "Deskripsi gambar", // opsional
         },
         // ...bagian lainnya
       ],
     },
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

2. Daftarkan di `index.ts` mata pelajaran terkait:

   ```ts
   import bab2 from "./bab-2-nama-bab";
   chapters: [bab1, bab2],
   ```

3. Bab baru otomatis muncul di halaman mata pelajaran sebagai kartu baru, lengkap dengan tombol "📖 Baca Materi" (jika `material` diisi) dan "Main Sekarang" untuk kuis dengan pengacakan soal & jawaban.

## Struktur proyek

```
src/
  app/
    page.tsx                    -> halaman utama (katalog mata pelajaran)
    mapel/[subjectId]/page.tsx  -> halaman daftar bab per mata pelajaran
    materi/[chapterId]/page.tsx -> halaman bacaan materi per bab
    quiz/[chapterId]/page.tsx   -> halaman kuis per bab
  components/
    MaterialView.tsx -> tampilan halaman materi bacaan
    QuizGame.tsx    -> logika game & pengacakan
    QuestionCard.tsx -> tampilan satu soal
    ResultScreen.tsx -> tampilan skor akhir
  data/subjects/    -> semua mata pelajaran, tiap folder = 1 mapel berisi bab-bab
  lib/shuffle.ts    -> util pengacakan (Fisher-Yates)
  types/quiz.ts     -> tipe data soal, materi, bab & mata pelajaran
```
