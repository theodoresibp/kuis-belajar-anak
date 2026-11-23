import type { QuizChapter, QuizQuestion } from "@/types/quiz";

const A = "/assets/matematika";

type Q = [question: string, correct: string, wrong: string[], explanation: string, image?: readonly [src: string, alt: string]];

const IMG = {
  persegi: [`${A}/bangun-datar-persegi.png`, "Bangun persegi berwarna oranye"],
  persegiPanjang: [`${A}/bangun-datar-persegi-panjang.png`, "Bangun persegi panjang berwarna merah muda"],
  segitiga: [`${A}/bangun-datar-segitiga.png`, "Bangun segitiga berwarna kuning"],
  segilima: [`${A}/bangun-datar-segilima.png`, "Bangun segilima berwarna hijau"],
  segienam: [`${A}/bangun-datar-segienam.png`, "Bangun segi enam berwarna biru muda"],
  lingkaran: [`${A}/bangun-datar-lingkaran.png`, "Bangun lingkaran berwarna hijau toska"],
  oval: [`${A}/bangun-datar-oval.png`, "Bangun oval berwarna biru"],
  trapesium: [`${A}/bangun-datar-trapesium.png`, "Bangun trapesium berwarna ungu"],
  jajargenjang: [`${A}/bangun-datar-jajargenjang.png`, "Bangun jajargenjang berwarna merah"],
  belahKetupat: [`${A}/bangun-datar-belah-ketupat.png`, "Bangun belah ketupat berwarna kuning"],
  layang: [`${A}/bangun-datar-layang-layang.png`, "Bangun layang-layang berwarna biru tua"],
  sisiSudut: [`${A}/sisi-sudut-titik-sudut.png`, "Persegi panjang dengan tanda sisi, sudut, dan titik sudut"],
  tanyaTitikSudut: [`${A}/tanya-titik-sudut.png`, "Persegi panjang dengan tanda panah di salah satu pojoknya"],
  urai: [`${A}/mengurai-bangun-datar.jpeg`, "Segi enam diurai menjadi dua trapesium, trapesium diurai menjadi dua segitiga dan persegi panjang"],
  uraiSegienam: [`${A}/mengurai-segienam.jpeg`, "Segi enam dipotong menjadi dua bangun"],
  uraiTrapesium: [`${A}/mengurai-trapesium.jpeg`, "Trapesium dipotong menjadi tiga bangun"],
  susun: [`${A}/menyusun-bangun-datar.jpeg`, "Dua segitiga dan trapesium disusun menjadi bangun baru"],
  susunPersegiPanjang: [`${A}/menyusun-persegi-panjang.jpeg`, "Beberapa potongan bangun disusun menjadi bangun baru"],
  kubus: [`${A}/bangun-ruang-kubus.png`, "Bangun ruang kubus berwarna kuning"],
  balok: [`${A}/bangun-ruang-balok.png`, "Bangun ruang balok berwarna biru"],
  bola: [`${A}/bangun-ruang-bola.png`, "Bangun ruang bola berwarna merah"],
  tabung: [`${A}/bangun-ruang-tabung.png`, "Bangun ruang tabung berwarna hijau"],
  kerucut: [`${A}/bangun-ruang-kerucut.png`, "Bangun ruang kerucut berwarna ungu"],
  kubusInfo: [`${A}/kubus-sisi-rusuk-titik-sudut.jpeg`, "Gambar kubus dengan keterangan sisi, rusuk, dan titik sudut"],
  balokInfo: [`${A}/balok-sisi-rusuk-titik-sudut.jpeg`, "Gambar balok dengan keterangan sisi, rusuk, dan titik sudut"],
} as const satisfies Record<string, readonly [string, string]>;

const LETTERS = ["a", "b", "c", "d"];

const raw: Q[] = [
  // ===== Mengenal bangun datar =====
  ["Perhatikan gambar! Nama bangun datar ini adalah ...", "Segilima", ["Segi enam", "Segitiga", "Persegi"], "Betul! Bangun ini memiliki 5 sisi, namanya segilima.", IMG.segilima],
  ["Perhatikan gambar! Nama bangun datar ini adalah ...", "Trapesium", ["Jajargenjang", "Persegi panjang", "Belah ketupat"], "Betul! Itu adalah trapesium.", IMG.trapesium],
  ["Perhatikan gambar! Nama bangun datar ini adalah ...", "Jajargenjang", ["Trapesium", "Persegi", "Layang-layang"], "Betul! Itu adalah jajargenjang.", IMG.jajargenjang],
  ["Perhatikan gambar! Nama bangun datar ini adalah ...", "Belah ketupat", ["Persegi", "Segitiga", "Oval"], "Betul! Itu adalah belah ketupat.", IMG.belahKetupat],
  ["Perhatikan gambar! Nama bangun datar ini adalah ...", "Layang-layang", ["Belah ketupat", "Segitiga", "Trapesium"], "Betul! Itu adalah layang-layang.", IMG.layang],
  ["Perhatikan gambar! Nama bangun datar ini adalah ...", "Oval", ["Lingkaran", "Bola", "Segilima"], "Betul! Itu adalah oval.", IMG.oval],
  ["Perhatikan gambar! Nama bangun datar ini adalah ...", "Segi enam", ["Segilima", "Trapesium", "Lingkaran"], "Betul! Bangun ini memiliki 6 sisi, namanya segi enam.", IMG.segienam],
  ["Bangun datar yang dibatasi garis lurus disebut ...", "Segi banyak", ["Bangun ruang", "Bangun lengkung", "Titik sudut"], "Betul! Bangun datar yang dibatasi garis lurus disebut segi banyak."],
  ["Bangun datar berikut yang BUKAN segi banyak adalah ...", "Lingkaran", ["Segitiga", "Persegi", "Trapesium"], "Betul! Lingkaran memiliki sisi lengkung, jadi bukan segi banyak."],
  ["Perhatikan gambar! Lingkaran memiliki ... sudut.", "0 (tidak memiliki)", ["1", "2", "4"], "Betul! Bangun dengan sisi lengkung tidak memiliki sudut dan titik sudut.", IMG.lingkaran],
  // ===== Sisi, sudut, titik sudut =====
  ["Garis lurus pada bangun datar disebut ...", "Sisi", ["Sudut", "Titik sudut", "Rusuk"], "Betul! Sisi adalah garis lurus pada bangun datar.", IMG.sisiSudut],
  ["Daerah yang dibentuk oleh pertemuan dua sisi disebut ...", "Sudut", ["Sisi", "Rusuk", "Titik puncak"], "Betul! Sudut adalah daerah yang dibentuk oleh pertemuan dua sisi."],
  ["Perhatikan gambar! Titik yang ditunjuk tanda panah disebut ...", "Titik sudut", ["Sisi", "Rusuk", "Titik puncak"], "Betul! Titik pertemuan dari dua sisi disebut titik sudut.", IMG.tanyaTitikSudut],
  ["Perhatikan gambar! Segitiga memiliki ... sisi.", "3", ["4", "5", "2"], "Betul! Segitiga memiliki 3 sisi.", IMG.segitiga],
  ["Perhatikan gambar! Persegi memiliki ... titik sudut.", "4", ["3", "5", "6"], "Betul! Persegi memiliki 4 titik sudut.", IMG.persegi],
  ["Perhatikan gambar! Segilima memiliki ... sudut.", "5", ["4", "6", "3"], "Betul! Segilima memiliki 5 sudut.", IMG.segilima],
  ["Perhatikan gambar! Segi enam memiliki ... sisi.", "6", ["5", "8", "4"], "Betul! Segi enam memiliki 6 sisi.", IMG.segienam],
  ["Perhatikan gambar! Persegi panjang memiliki ... sisi.", "4", ["3", "5", "6"], "Betul! Persegi panjang memiliki 4 sisi.", IMG.persegiPanjang],
  ["Bangun datar yang memiliki 3 sisi dan 3 titik sudut adalah ...", "Segitiga", ["Persegi", "Segilima", "Lingkaran"], "Betul! Segitiga memiliki 3 sisi dan 3 titik sudut."],
  ["Bangun datar yang tidak memiliki sudut dan titik sudut adalah ...", "Oval", ["Trapesium", "Persegi", "Segitiga"], "Betul! Oval memiliki sisi lengkung, jadi tidak memiliki sudut."],
  // ===== Mengurai & menyusun =====
  ["Perhatikan gambar! Segi enam dapat diurai menjadi dua bentuk ...", "Trapesium", ["Lingkaran", "Persegi", "Oval"], "Betul! Segi enam dapat diurai menjadi dua trapesium.", IMG.uraiSegienam],
  ["Perhatikan gambar! Trapesium dapat diurai menjadi ...", "Dua segitiga dan persegi panjang", ["Dua lingkaran", "Tiga persegi", "Dua oval"], "Betul! Trapesium dapat diurai menjadi dua segitiga dan persegi panjang.", IMG.uraiTrapesium],
  ["Jika dua trapesium yang sama disusun, dapat membentuk bangun ...", "Segi enam", ["Lingkaran", "Segitiga", "Oval"], "Betul! Dua trapesium dapat disusun menjadi segi enam.", IMG.urai],
  ["Perhatikan gambar! Dua segitiga dan trapesium dapat disusun menjadi ...", "Beberapa bentuk bangun baru", ["Bangun ruang bola", "Lingkaran", "Oval"], "Betul! Dua segitiga dan trapesium dapat disusun menjadi beberapa bentuk.", IMG.susun],
  ["Memotong sebuah bangun datar menjadi beberapa bangun datar lain disebut ...", "Mengurai", ["Menyusun", "Mewarnai", "Menghitung"], "Betul! Itu disebut mengurai bangun datar."],
  ["Menggabungkan beberapa bangun datar menjadi bangun baru disebut ...", "Menyusun", ["Mengurai", "Memotong", "Menggambar"], "Betul! Itu disebut menyusun bangun datar.", IMG.susunPersegiPanjang],
  // ===== Bangun ruang: pengertian =====
  ["Bangun ruang memiliki ...", "Sisi, rusuk, dan titik sudut", ["Hanya sisi saja", "Hanya titik sudut", "Tidak memiliki apa-apa"], "Betul! Bangun ruang memiliki sisi, rusuk, dan titik sudut."],
  ["Daerah atau bidang datar yang membatasi bangun ruang disebut ...", "Sisi", ["Rusuk", "Titik sudut", "Titik puncak"], "Betul! Sisi adalah bidang yang membatasi bangun ruang, seperti permukaan luar kotak."],
  ["Garis pertemuan antara dua sisi pada bangun ruang disebut ...", "Rusuk", ["Sisi", "Titik sudut", "Sudut"], "Betul! Rusuk adalah garis pertemuan dua sisi, seperti kerangka kotak."],
  ["Titik pertemuan tiga buah rusuk atau lebih disebut ...", "Titik sudut", ["Rusuk", "Sisi", "Bidang"], "Betul! Titik sudut adalah pojok tempat bertemunya tiga rusuk atau lebih."],
  // ===== Kubus & balok =====
  ["Perhatikan gambar! Nama bangun ruang ini adalah ...", "Kubus", ["Balok", "Tabung", "Persegi"], "Betul! Itu adalah kubus.", IMG.kubus],
  ["Perhatikan gambar! Kubus memiliki ... sisi.", "6", ["4", "8", "12"], "Betul! Kubus memiliki 6 sisi.", IMG.kubusInfo],
  ["Semua sisi kubus berbentuk ...", "Persegi", ["Segitiga", "Lingkaran", "Trapesium"], "Betul! Keenam sisi kubus berbentuk persegi."],
  ["Kubus memiliki ... rusuk yang semuanya sama panjang.", "12", ["6", "8", "4"], "Betul! Kubus memiliki 12 rusuk yang sama panjang."],
  ["Kubus memiliki ... titik sudut.", "8", ["6", "12", "4"], "Betul! Kubus memiliki 8 titik sudut."],
  ["Perhatikan gambar! Nama bangun ruang ini adalah ...", "Balok", ["Kubus", "Persegi panjang", "Tabung"], "Betul! Itu adalah balok.", IMG.balok],
  ["Perhatikan gambar! Balok memiliki ... rusuk.", "12", ["6", "8", "10"], "Betul! Balok memiliki 12 rusuk.", IMG.balokInfo],
  ["Balok memiliki ... sisi dan ... titik sudut.", "6 sisi dan 8 titik sudut", ["8 sisi dan 6 titik sudut", "4 sisi dan 4 titik sudut", "12 sisi dan 8 titik sudut"], "Betul! Balok memiliki 6 sisi dan 8 titik sudut."],
  ["Benda di sekitar kita yang berbentuk balok adalah ...", "Kotak pensil", ["Bola sepak", "Kaleng susu", "Topi ulang tahun"], "Betul! Kotak pensil berbentuk balok."],
  // ===== Tabung =====
  ["Perhatikan gambar! Nama bangun ruang ini adalah ...", "Tabung", ["Kerucut", "Bola", "Lingkaran"], "Betul! Itu adalah tabung.", IMG.tabung],
  ["Tabung memiliki ... sisi.", "3", ["2", "1", "6"], "Betul! Tabung memiliki 3 sisi."],
  ["Tabung memiliki ... rusuk lengkung.", "2", ["1", "3", "12"], "Betul! Tabung memiliki 2 rusuk lengkung."],
  ["Sisi alas dan sisi atas tabung berbentuk ...", "Lingkaran", ["Persegi", "Segitiga", "Persegi panjang"], "Betul! Sisi alas dan sisi atas tabung berbentuk lingkaran."],
  // ===== Kerucut =====
  ["Perhatikan gambar! Nama bangun ruang ini adalah ...", "Kerucut", ["Tabung", "Segitiga", "Bola"], "Betul! Itu adalah kerucut.", IMG.kerucut],
  ["Kerucut memiliki ... sisi dan ... rusuk lengkung.", "2 sisi dan 1 rusuk lengkung", ["3 sisi dan 2 rusuk lengkung", "1 sisi dan 0 rusuk", "6 sisi dan 12 rusuk"], "Betul! Kerucut memiliki 2 sisi dan 1 rusuk lengkung."],
  ["Kerucut tidak memiliki titik sudut, tetapi memiliki ...", "Titik puncak", ["8 titik sudut", "Rusuk lurus", "Sisi persegi"], "Betul! Kerucut memiliki titik puncak."],
  ["Benda di sekitar kita yang berbentuk kerucut adalah ...", "Topi ulang tahun", ["Kotak sepatu", "Kaleng susu", "Bola basket"], "Betul! Topi ulang tahun berbentuk kerucut."],
  // ===== Bola =====
  ["Perhatikan gambar! Bola memiliki ...", "Satu sisi lengkung", ["Dua sisi lengkung", "Enam sisi", "Tiga sisi"], "Betul! Bola memiliki satu sisi lengkung.", IMG.bola],
  ["Bangun ruang yang tidak memiliki rusuk dan tidak memiliki titik sudut adalah ...", "Bola", ["Kubus", "Balok", "Kerucut"], "Betul! Bola tidak memiliki rusuk dan titik sudut."],
  ["Bangun ruang yang memiliki 3 sisi, 2 rusuk lengkung, dan tidak memiliki titik sudut adalah ...", "Tabung", ["Kerucut", "Bola", "Kubus"], "Betul! Itu adalah ciri-ciri tabung."],
];

const questions: QuizQuestion[] = raw.map(([question, correct, wrong, explanation, image], i) => ({
  id: `psas-mtk3-${String(i + 1).padStart(2, "0")}`,
  question,
  ...(image ? { image: image[0], imageAlt: image[1] } : {}),
  options: [correct, ...wrong].map((text, j) => ({ id: LETTERS[j], text })),
  correctOptionId: "a",
  explanation,
}));

const chapter: QuizChapter = {
  id: "psas-bab-3-bangun-datar-dan-bangun-ruang",
  title: "PSAS: Bangun Datar dan Bangun Ruang",
  subtitle: "Latihan PSAS Ganjil untuk Bab 3: segi banyak, sisi & sudut, mengurai bangun datar, serta ciri-ciri bangun ruang",
  emoji: "📝",
  category: "PSAS",
  gradient: "from-blue-400 via-cyan-300 to-sky-300",
  material: {
    summary:
      "Ringkasan Bab 3 untuk persiapan PSAS: nama-nama bangun datar, sisi, sudut, dan titik sudut, mengurai dan menyusun bangun datar, serta ciri-ciri kubus, balok, tabung, kerucut, dan bola.",
    sections: [
      {
        heading: "Mengenal Bangun Datar",
        emoji: "🔷",
        images: [
          { src: IMG.persegi[0], alt: IMG.persegi[1], caption: "Persegi" },
          { src: IMG.segitiga[0], alt: IMG.segitiga[1], caption: "Segitiga" },
          { src: IMG.segilima[0], alt: IMG.segilima[1], caption: "Segilima" },
          { src: IMG.lingkaran[0], alt: IMG.lingkaran[1], caption: "Lingkaran" },
          { src: IMG.persegiPanjang[0], alt: IMG.persegiPanjang[1], caption: "Persegi panjang" },
          { src: IMG.belahKetupat[0], alt: IMG.belahKetupat[1], caption: "Belah ketupat" },
          { src: IMG.jajargenjang[0], alt: IMG.jajargenjang[1], caption: "Jajargenjang" },
          { src: IMG.trapesium[0], alt: IMG.trapesium[1], caption: "Trapesium" },
          { src: IMG.oval[0], alt: IMG.oval[1], caption: "Oval" },
          { src: IMG.layang[0], alt: IMG.layang[1], caption: "Layang-layang" },
        ],
        bullets: [
          "Bangun datar yang dibatasi garis lurus disebut segi banyak.",
          "Pada segi banyak terdapat sudut dan titik sudut.",
          "Bangun dengan sisi lengkung (lingkaran, oval) tidak memiliki sudut dan titik sudut.",
        ],
      },
      {
        heading: "Sisi, Sudut, dan Titik Sudut",
        emoji: "📐",
        image: IMG.sisiSudut[0],
        imageAlt: IMG.sisiSudut[1],
        bullets: [
          "Sisi adalah garis lurus pada bangun datar.",
          "Sudut adalah daerah yang dibentuk oleh pertemuan dua sisi.",
          "Titik sudut adalah titik pertemuan dari dua sisi.",
        ],
      },
      {
        heading: "Mengurai dan Menyusun Bangun Datar",
        emoji: "✂️",
        images: [
          { src: IMG.urai[0], alt: IMG.urai[1], caption: "Mengurai segi enam dan trapesium" },
          { src: IMG.susun[0], alt: IMG.susun[1], caption: "Menyusun bangun datar" },
        ],
        bullets: [
          "Segi enam dapat diurai menjadi dua bentuk trapesium.",
          "Trapesium dapat diurai menjadi dua segitiga dan persegi panjang.",
          "Dua segitiga dan trapesium dapat disusun menjadi beberapa bentuk.",
        ],
      },
      {
        heading: "Bangun Ruang",
        emoji: "🧊",
        images: [
          { src: IMG.balok[0], alt: IMG.balok[1], caption: "Balok" },
          { src: IMG.kubus[0], alt: IMG.kubus[1], caption: "Kubus" },
          { src: IMG.bola[0], alt: IMG.bola[1], caption: "Bola" },
          { src: IMG.tabung[0], alt: IMG.tabung[1], caption: "Tabung" },
          { src: IMG.kerucut[0], alt: IMG.kerucut[1], caption: "Kerucut" },
        ],
        bullets: [
          "Bangun ruang memiliki sisi, rusuk, dan titik sudut.",
          "Sisi: bidang datar yang membatasi bangun ruang (seperti permukaan luar kotak).",
          "Rusuk: garis pertemuan antara dua sisi (seperti kerangka kotak).",
          "Titik sudut: pojok tempat bertemunya tiga rusuk atau lebih.",
        ],
      },
      {
        heading: "Kubus dan Balok",
        emoji: "📦",
        images: [
          { src: IMG.kubusInfo[0], alt: IMG.kubusInfo[1], caption: "Kubus" },
          { src: IMG.balokInfo[0], alt: IMG.balokInfo[1], caption: "Balok" },
        ],
        bullets: [
          "Kubus: 6 sisi (semuanya persegi), 12 rusuk (semuanya sama panjang), 8 titik sudut.",
          "Balok: 6 sisi, 12 rusuk, 8 titik sudut.",
        ],
      },
      {
        heading: "Tabung, Kerucut, dan Bola",
        emoji: "🥫",
        images: [
          { src: IMG.tabung[0], alt: IMG.tabung[1], caption: "Tabung" },
          { src: IMG.kerucut[0], alt: IMG.kerucut[1], caption: "Kerucut" },
          { src: IMG.bola[0], alt: IMG.bola[1], caption: "Bola" },
        ],
        bullets: [
          "Tabung: 3 sisi, 2 rusuk lengkung, sisi alas dan atas berbentuk lingkaran, tidak memiliki titik sudut.",
          "Kerucut: 2 sisi, 1 rusuk lengkung, sisi alas berbentuk lingkaran, tidak memiliki titik sudut tetapi memiliki titik puncak.",
          "Bola: 1 sisi lengkung, tidak memiliki rusuk, tidak memiliki titik sudut.",
        ],
      },
    ],
  },
  questions,
};

export default chapter;
