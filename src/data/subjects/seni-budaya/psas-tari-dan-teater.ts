import type { QuizChapter, QuizQuestion } from "@/types/quiz";

const S = "/assets/seni-budaya";

type Q = [question: string, correct: string, wrong: string[], explanation: string, image?: readonly [src: string, alt: string]];

const IMG = {
  diTempat: [`${S}/gerak-di-tempat.jpg`, "Para penari duduk berjajar menari di tempat"],
  sedang: [`${S}/gerak-tari-sedang.jpg`, "Penari menari dalam posisi berdiri dan kuda-kuda"],
  kuat: [`${S}/gerak-tari-kuat.jpg`, "Penari mengangkat kaki kanan dan berjinjit dengan bertenaga"],
  lemah: [`${S}/gerak-tari-lemah.jpg`, "Dua penari menari dengan gerakan lembut dan gemulai membawa piring"],
  samping: [`${S}/arah-gerak-ke-samping.jpg`, "Anak menari dengan arah gerak ke samping dalam tiga langkah"],
  melingkar: [`${S}/pola-tari-melingkar.jpg`, "Anak-anak bergandengan tangan membentuk lingkaran"],
  pedang: [`${S}/pedang-mainan.jpg`, "Gambar pedang mainan"],
  busur: [`${S}/busur-panah.jpg`, "Gambar busur dan anak panah"],
  caping: [`${S}/caping.jpg`, "Gambar caping atau topi petani"],
  horizontal: [`${S}/pola-lantai-horizontal.svg`, "Titik-titik penari berjajar mendatar dari kiri ke kanan"],
  vertikal: [`${S}/pola-lantai-vertikal.svg`, "Titik-titik penari berjajar lurus dari depan ke belakang"],
  diagonal: [`${S}/pola-lantai-diagonal.svg`, "Titik-titik penari berjajar miring"],
  zigzag: [`${S}/pola-lantai-zigzag.svg`, "Titik-titik penari membentuk garis berkelok tajam seperti huruf W"],
  lingkaran: [`${S}/pola-lantai-lingkaran.svg`, "Titik-titik penari membentuk lingkaran"],
  lengkungDepan: [`${S}/pola-lantai-lengkung-depan.svg`, "Titik-titik penari membentuk lengkungan yang melengkung ke arah penonton"],
  lengkungBelakang: [`${S}/pola-lantai-lengkung-belakang.svg`, "Titik-titik penari membentuk lengkungan yang melengkung menjauhi penonton"],
} as const satisfies Record<string, readonly [string, string]>;

const LETTERS = ["a", "b", "c", "d"];

const raw: Q[] = [
  // ===== Pelajaran 3: Tema tari =====
  ["Ide dasar dalam tari disebut ...", "Tema", ["Tempo", "Durasi", "Pola lantai"], "Betul! Tema adalah ide dasar dalam tari."],
  ["Berikut ini yang termasuk macam-macam tema tari adalah ...", "Cerita rakyat", ["Pola lantai", "Tempo cepat", "Pendinginan"], "Betul! Tema tari: kegiatan sehari-hari, pengalaman hidup, cerita rakyat, dan kisah kepahlawanan."],
  ["Tari yang menceritakan perjuangan seorang pahlawan memiliki tema ...", "Kisah kepahlawanan", ["Kegiatan sehari-hari", "Cerita rakyat", "Bunyi sekitar"], "Betul! Itu adalah tema kisah kepahlawanan."],
  ["Tari yang menirukan kegiatan menyapu dan mencuci memiliki tema ...", "Kegiatan sehari-hari", ["Kisah kepahlawanan", "Cerita rakyat", "Pantomim"], "Betul! Menyapu dan mencuci adalah kegiatan sehari-hari."],
  ["Perhatikan gambar! Pedang mainan cocok dipakai untuk menari dengan tema ...", "Kisah kepahlawanan", ["Kegiatan memasak", "Kupu-kupu terbang", "Pohon tertiup angin"], "Betul! Pedang cocok untuk tari bertema kepahlawanan.", IMG.pedang],
  ["Perhatikan gambar! Benda ini dapat dipakai untuk gerak tari meniru ...", "Memanah", ["Menyapu", "Mengelap kaca", "Kupu-kupu terbang"], "Betul! Busur dan anak panah dipakai untuk gerak tari meniru memanah.", IMG.busur],
  ["Perhatikan gambar! Caping biasa dipakai untuk tari yang meniru kegiatan ...", "Petani di sawah", ["Pahlawan berperang", "Harimau mengaum", "Kupu-kupu terbang"], "Betul! Caping adalah topi yang biasa dipakai petani.", IMG.caping],
  ["Mendengar suara air terjun dan burung berkicau adalah cara menentukan tema tari dengan ...", "Mendengar bunyi sekitar", ["Menonton video peristiwa", "Meniru gerakan yang sudah ada", "Mengamati objek sekitar"], "Betul! Itu termasuk mendengar bunyi sekitar."],
  ["Melihat pemandangan alam untuk menentukan tema tari termasuk cara ...", "Mengamati objek sekitar", ["Mendengar bunyi sekitar", "Menonton video peristiwa", "Pendinginan"], "Betul! Melihat pemandangan alam termasuk mengamati objek sekitar."],
  ["Meniru gerakan hewan, tumbuhan, dan alam sekitar termasuk cara menentukan tema dengan ...", "Meniru gerakan yang sudah ada", ["Mendengar bunyi sekitar", "Menonton video", "Membaca puisi"], "Betul! Itu termasuk meniru gerakan yang sudah ada."],
  // ===== Gerak di tempat & berpindah tempat =====
  ["Berjongkok, menolehkan kepala, dan merentangkan tangan adalah contoh gerak ...", "Di tempat", ["Berpindah tempat", "Berlari", "Melompat jauh"], "Betul! Itu adalah contoh gerak di tempat."],
  ["Berjalan, melangkah, dan berlari adalah contoh gerak ...", "Berpindah tempat", ["Di tempat", "Pendinginan", "Pantomim"], "Betul! Itu adalah contoh gerak berpindah tempat."],
  ["Perhatikan gambar! Para penari menari sambil duduk tanpa berpindah. Ini adalah contoh gerak ...", "Di tempat", ["Berpindah tempat", "Berlari", "Zigzag"], "Betul! Penari tidak berpindah, jadi termasuk gerak di tempat.", IMG.diTempat],
  ["Gerak di tempat membutuhkan ruang yang lebih ...", "Sempit", ["Luas", "Tinggi", "Panjang"], "Betul! Gerak di tempat membutuhkan ruang yang lebih sempit."],
  ["Gerak berpindah tempat membutuhkan ruang yang lebih ...", "Luas", ["Sempit", "Gelap", "Kecil"], "Betul! Gerak berpindah tempat membutuhkan ruang yang lebih luas."],
  ["Ketika melakukan gerak berpindah tempat, yang ikut berpindah adalah ...", "Arah hadap dan arah gerak penari", ["Musik pengiring", "Penonton", "Panggung"], "Betul! Arah hadap dan arah gerak penari juga berpindah."],
  ["Perhatikan gambar! Anak tersebut menari dengan arah gerak ke ...", "Samping", ["Atas", "Bawah", "Belakang"], "Betul! Gambar menunjukkan arah gerak tari ke samping.", IMG.samping],
  // ===== Pola lantai =====
  ["Garis yang dilalui penari saat berpindah tempat disebut ...", "Pola lantai", ["Tema tari", "Tempo", "Durasi"], "Betul! Pola lantai adalah garis yang dilalui penari saat berpindah tempat."],
  ["Pola lantai terbagi menjadi 2 kelompok garis, yaitu ...", "Garis lurus dan garis lengkung", ["Garis putus dan garis titik", "Garis tebal dan garis tipis", "Garis merah dan garis biru"], "Betul! Pola lantai terbagi menjadi garis lurus dan garis lengkung."],
  ["Perhatikan gambar! Pola lantai tersebut adalah pola ...", "Horizontal", ["Vertikal", "Lingkaran", "Zigzag"], "Betul! Penari berjajar mendatar membentuk pola horizontal.", IMG.horizontal],
  ["Perhatikan gambar! Penari berjajar lurus dari depan ke belakang. Pola lantai ini adalah pola ...", "Vertikal", ["Horizontal", "Lengkung", "Lingkaran"], "Betul! Itu adalah pola vertikal.", IMG.vertikal],
  ["Perhatikan gambar! Pola lantai yang berbentuk miring ini disebut pola ...", "Diagonal", ["Vertikal", "Horizontal", "Lingkaran"], "Betul! Pola miring disebut pola diagonal.", IMG.diagonal],
  ["Perhatikan gambar! Pola lantai yang berkelok tajam seperti ini disebut pola ...", "Zigzag", ["Lingkaran", "Horizontal", "Lengkung ke depan"], "Betul! Itu adalah pola zigzag.", IMG.zigzag],
  ["Perhatikan gambar! Anak-anak bergandengan tangan membentuk pola lantai ...", "Lingkaran", ["Vertikal", "Diagonal", "Zigzag"], "Betul! Gambar menunjukkan pola tari melingkar.", IMG.melingkar],
  ["Perhatikan gambar! Pola lantai yang melengkung ke arah penonton ini disebut pola ...", "Lengkung ke depan", ["Lengkung belakang", "Horizontal", "Zigzag"], "Betul! Itu adalah pola lengkung ke depan.", IMG.lengkungDepan],
  ["Perhatikan gambar! Pola lantai yang melengkung menjauhi penonton ini disebut pola ...", "Lengkung belakang", ["Lengkung ke depan", "Vertikal", "Diagonal"], "Betul! Itu adalah pola lengkung belakang.", IMG.lengkungBelakang],
  ["Berikut ini yang termasuk pola lantai garis lurus adalah ...", "Pola zigzag", ["Pola lingkaran", "Pola lengkung ke depan", "Pola lengkung belakang"], "Betul! Zigzag termasuk pola garis lurus."],
  // ===== Tingkatan gerak =====
  ["Gerakan ketika anggota tubuh menyentuh lantai, seperti merangkak dan duduk bersimpuh, termasuk tingkatan ...", "Rendah", ["Sedang", "Tinggi", "Cepat"], "Betul! Itu adalah tingkatan gerak rendah."],
  ["Perhatikan gambar! Penari menari dalam posisi berdiri dan kuda-kuda. Ini termasuk tingkatan gerak ...", "Sedang", ["Rendah", "Tinggi", "Lambat"], "Betul! Gerakan saat berdiri termasuk tingkatan sedang.", IMG.sedang],
  ["Melompat, berjinjit, dan melayang termasuk tingkatan gerak ...", "Tinggi", ["Rendah", "Sedang", "Lemah"], "Betul! Gerakan ketika kaki menjauhi lantai termasuk tingkatan tinggi."],
  // ===== Gerak kuat & lemah =====
  ["Gerakan yang dilakukan dengan sangat bertenaga disebut gerak ...", "Kuat", ["Lemah", "Lambat", "Sedang"], "Betul! Gerak kuat dilakukan dengan sangat bertenaga."],
  ["Gerak kuat memiliki kesan ...", "Semangat, gembira, dan kuat", ["Tenang dan lembut", "Sedih dan haru", "Mengantuk"], "Betul! Gerak kuat berkesan semangat, gembira, dan kuat."],
  ["Gerak tari meniru harimau mengaum termasuk gerak ...", "Kuat", ["Lemah", "Di tempat saja", "Pendinginan"], "Betul! Meniru harimau mengaum termasuk gerak kuat."],
  ["Perhatikan gambar! Gerakan penari yang bertenaga ini termasuk gerak tari ...", "Kuat", ["Lemah", "Lambat", "Pantomim"], "Betul! Gambar menunjukkan gerak tari kuat.", IMG.kuat],
  ["Perhatikan gambar! Gerakan penari yang lembut dan gemulai ini termasuk gerak tari ...", "Lemah", ["Kuat", "Cepat", "Tinggi"], "Betul! Gambar menunjukkan gerak tari lemah.", IMG.lemah],
  ["Berikut ini yang termasuk gerak lemah adalah ...", "Meniru kupu-kupu terbang", ["Meniru katak melompat", "Meniru nelayan menarik jala", "Meniru harimau mengaum"], "Betul! Meniru kupu-kupu terbang termasuk gerak lemah."],
  // ===== Durasi, tempo, tahapan =====
  ["Waktu dalam tari disebut ...", "Durasi", ["Tempo", "Tema", "Pola lantai"], "Betul! Waktu dalam tari disebut durasi."],
  ["Cepat lambatnya sebuah gerakan tari disebut ...", "Tempo", ["Durasi", "Tema", "Properti"], "Betul! Cepat lambatnya gerakan disebut tempo."],
  ["Gerakan lambat dan lemah diiringi musik bertempo ...", "Lambat", ["Cepat", "Sangat keras", "Tidak ada musik"], "Betul! Gerakan lambat dan lemah diiringi musik bertempo lambat."],
  ["Urutan tahapan menciptakan gerak tari yang benar adalah ...", "Menentukan tema, eksplorasi, improvisasi", ["Improvisasi, eksplorasi, menentukan tema", "Eksplorasi, menentukan tema, improvisasi", "Pendinginan, pemanasan, gerakan inti"], "Betul! Tentukan tema, coba gerak (eksplorasi), lalu kembangkan gerak (improvisasi)."],
  // ===== Pelajaran 4: Teater =====
  ["Pertunjukan drama yang dilakukan di atas panggung disebut ...", "Seni teater", ["Seni rupa", "Pola lantai", "Tempo"], "Betul! Seni teater adalah pertunjukan drama di atas panggung."],
  ["Orang yang ahli di bidang seni disebut ...", "Seniman", ["Petani", "Nelayan", "Penonton"], "Betul! Seniman adalah orang yang ahli di bidang seni."],
  ["Fungsi pemanasan sebelum teater adalah ...", "Agar tubuh lentur dan mencegah cedera", ["Agar cepat lelah", "Agar tubuh kaku", "Agar mengantuk"], "Betul! Pemanasan membuat tubuh lentur dan mencegah cedera."],
  ["Menolehkan, mengangguk, dan menggelengkan kepala termasuk gerak dasar ...", "Kepala", ["Lutut", "Pundak", "Wajah"], "Betul! Itu adalah gerak dasar kepala."],
  ["Cara melatih kelenturan otot wajah adalah dengan berlatih huruf vokal ...", "A, I, U, E, O", ["B, C, D, F, G", "K, L, M, N, P", "X, Y, Z"], "Betul! Kita berlatih huruf vokal A, I, U, E, O."],
  ["Pertunjukan yang meniru gerakan wajah dan tubuh tanpa bicara disebut ...", "Pantomim", ["Puisi", "Kata sambung", "Pemanasan"], "Betul! Pantomim dilakukan tanpa bicara."],
  ["Pendinginan dilakukan ... melakukan gerakan.", "Setelah", ["Sebelum", "Sambil", "Tanpa"], "Betul! Pendinginan dilakukan setelah melakukan gerakan."],
  ["Bunyi \"ngiik-ngiik\" adalah tiruan suara ...", "Kuda", ["Tikus", "Harimau", "Motor"], "Betul! Kuda berbunyi ngiik-ngiik."],
  ["Permainan menyambungkan kata demi kata hingga menjadi kalimat disebut permainan ...", "Kata sambung", ["Pantomim", "Pola lantai", "Pemanasan"], "Betul! Itu adalah permainan kata sambung."],
  ["Saat membaca puisi, hal yang perlu diperhatikan adalah ...", "Mengucapkan kata dengan jelas", ["Membaca sambil berbisik", "Membaca sangat cepat", "Tanpa ekspresi wajah"], "Betul! Ucapkan kata dengan jelas, nada sesuai, dan dengan gerak wajah."],
];

const questions: QuizQuestion[] = raw.map(([question, correct, wrong, explanation, image], i) => ({
  id: `psas-sb-${String(i + 1).padStart(2, "0")}`,
  question,
  ...(image ? { image: image[0], imageAlt: image[1] } : {}),
  options: [correct, ...wrong].map((text, j) => ({ id: LETTERS[j], text })),
  correctOptionId: "a",
  explanation,
}));

const chapter: QuizChapter = {
  id: "psas-tari-dan-teater",
  title: "PSAS: Seni Tari dan Teater",
  subtitle: "Latihan PSAS Ganjil Pelajaran 3 & 4: tema tari, pola lantai, tingkatan & tempo gerak, serta seni teater",
  emoji: "💃",
  category: "PSAS",
  gradient: "from-pink-400 via-orange-300 to-yellow-300",
  material: {
    summary:
      "Ringkasan untuk persiapan PSAS: tema tari, gerak di tempat dan berpindah tempat, pola lantai, tingkatan gerak, gerak kuat dan lemah, durasi dan tempo, serta seni teater dan pantomim.",
    sections: [
      {
        heading: "Tema Tari",
        emoji: "💡",
        images: [
          { src: IMG.pedang[0], alt: IMG.pedang[1], caption: "Pedang mainan" },
          { src: IMG.busur[0], alt: IMG.busur[1], caption: "Busur" },
          { src: IMG.caping[0], alt: IMG.caping[1], caption: "Caping" },
        ],
        paragraphs: [
          "Tema adalah ide dasar dalam tari. Macam-macam tema tari: kegiatan sehari-hari, pengalaman hidup, cerita rakyat, dan kisah kepahlawanan.",
        ],
        bullets: [
          "Mendengar bunyi sekitar: suara air terjun, burung berkicau, tepuk tangan.",
          "Mengamati objek sekitar: pemandangan alam, benda sekitar, kegiatan sehari-hari.",
          "Menonton video peristiwa.",
          "Meniru gerakan yang sudah ada: gerakan hewan, tumbuhan, alam sekitar.",
        ],
      },
      {
        heading: "Gerak di Tempat dan Berpindah Tempat",
        emoji: "🚶",
        images: [
          { src: IMG.diTempat[0], alt: IMG.diTempat[1], caption: "Gerak tari di tempat" },
          { src: IMG.samping[0], alt: IMG.samping[1], caption: "Arah gerak tari ke samping" },
        ],
        bullets: [
          "Gerak di tempat: berjongkok, menolehkan kepala, membungkukkan badan, merentangkan tangan. Membutuhkan ruang lebih sempit.",
          "Gerak berpindah tempat: berjalan, melangkah, berlari. Membutuhkan ruang lebih luas.",
          "Saat berpindah tempat, arah hadap dan arah gerak penari juga berpindah.",
        ],
      },
      {
        heading: "Pola Lantai",
        emoji: "📐",
        images: [
          { src: IMG.horizontal[0], alt: IMG.horizontal[1], caption: "Horizontal" },
          { src: IMG.vertikal[0], alt: IMG.vertikal[1], caption: "Vertikal" },
          { src: IMG.diagonal[0], alt: IMG.diagonal[1], caption: "Diagonal/miring" },
          { src: IMG.zigzag[0], alt: IMG.zigzag[1], caption: "Zigzag" },
          { src: IMG.lingkaran[0], alt: IMG.lingkaran[1], caption: "Lingkaran" },
          { src: IMG.lengkungDepan[0], alt: IMG.lengkungDepan[1], caption: "Lengkung ke depan" },
          { src: IMG.lengkungBelakang[0], alt: IMG.lengkungBelakang[1], caption: "Lengkung belakang" },
        ],
        paragraphs: [
          "Pola lantai adalah garis yang dilalui penari saat berpindah tempat. Pola lantai terbagi 2 kelompok: garis lurus (horizontal, vertikal, diagonal, zigzag) dan garis lengkung (lingkaran, lengkung ke depan, lengkung belakang).",
        ],
      },
      {
        heading: "Tingkatan Gerak Tari",
        emoji: "📶",
        image: IMG.sedang[0],
        imageAlt: IMG.sedang[1],
        bullets: [
          "Rendah (tubuh menyentuh lantai): merangkak, duduk bersimpuh, berlutut, berjongkok.",
          "Sedang (ketika berdiri): berdiri, posisi kuda-kuda, membungkukkan badan.",
          "Tinggi (kaki menjauhi lantai): melompat, berjinjit, melayang.",
        ],
      },
      {
        heading: "Gerak Kuat dan Gerak Lemah",
        emoji: "💪",
        images: [
          { src: IMG.kuat[0], alt: IMG.kuat[1], caption: "Gerak tari kuat" },
          { src: IMG.lemah[0], alt: IMG.lemah[1], caption: "Gerak tari lemah" },
        ],
        bullets: [
          "Gerak kuat: sangat bertenaga, berkesan semangat, gembira, dan kuat. Contoh: meniru harimau mengaum, nelayan menarik jala, katak/kelinci melompat, memanah.",
          "Gerak lemah: sedikit tenaga, berkesan tenang, gemulai, lembut, dan haru. Contoh: meniru pohon tertiup angin, menyapu, mengelap kaca, kupu-kupu terbang, mengayunkan badan.",
        ],
      },
      {
        heading: "Durasi, Tempo, dan Tahapan Menciptakan Tari",
        emoji: "⏱️",
        bullets: [
          "Waktu dalam tari disebut durasi.",
          "Cepat lambatnya gerakan disebut tempo: cepat, sedang, dan lambat.",
          "Tempo dipengaruhi iringan musik. Gerak cepat dan kuat → musik cepat. Gerak lambat dan lemah → musik lambat.",
          "Tahapan menciptakan gerak tari: 1) menentukan tema, 2) mencoba gerak (eksplorasi), 3) mengembangkan gerak (improvisasi).",
        ],
      },
      {
        heading: "Seni Teater",
        emoji: "🎭",
        paragraphs: [
          "Seni teater adalah pertunjukan drama yang dilakukan di atas panggung. Seniman adalah orang yang ahli di bidang seni.",
          "Urutan latihan teater: pemanasan (agar tubuh lentur dan mencegah cedera), gerakan inti, lalu pendinginan setelah selesai bergerak.",
        ],
        bullets: [
          "Gerak dasar kepala: menoleh, mendongak, memiringkan, mengangguk, menggeleng.",
          "Gerak dasar pundak/bahu: mengangkat dan menarik pundak.",
          "Gerak dasar lutut: berjongkok, berdiri, meluruskan kaki.",
          "Gerak dasar wajah: senang, tertawa, terkejut, marah, sedih, kesal. Melatihnya melenturkan otot wajah dengan berlatih vokal A, I, U, E, O.",
        ],
      },
      {
        heading: "Pantomim, Suara Sekitar, dan Puisi",
        emoji: "🤫",
        bullets: [
          "Pantomim: pertunjukan meniru gerakan wajah dan tubuh tanpa bicara.",
          "Suara sekitar: tikus cit-cit-cit, harimau aum-aum, kuda ngiik-ngiik, motor brum-brum, mobil ngeng-ngeng, kereta tut-tut-jegrek-jegrek.",
          "Permainan kata sambung: menyambungkan kata demi kata hingga menjadi kalimat.",
          "Membaca puisi: ucapkan kata dengan jelas, tinggi rendah nada yang sesuai, dan dengan gerak wajah.",
          "Bermain peran: memerankan tokoh dalam cerita.",
        ],
      },
    ],
  },
  questions,
};

export default chapter;
