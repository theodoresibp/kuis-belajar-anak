import type { QuizChapter } from "@/types/quiz";

const chapter: QuizChapter = {
  id: "bab-1-anggota-keluargaku",
  title: "Bab 1: Anggota Keluargaku",
  subtitle: "Kasih Sayang dalam Keluarga & Kisah Yesus di Bait Allah",
  emoji: "👨‍👩‍👧‍👦",
  gradient: "from-violet-400 via-purple-300 to-fuchsia-300",
  material: {
    summary:
      "Ayo belajar tentang keluarga sebagai anugerah Tuhan, cara menunjukkan kasih sayang, dan kisah Yesus di Bait Allah.",
    sections: [
      {
        heading: "Keluarga adalah Anugerah Tuhan",
        emoji: "👨‍👩‍👧‍👦",
        paragraphs: [
          "Keluarga merupakan anugerah dari Tuhan, tempat kita belajar untuk saling mengasihi.",
          "Anggota keluarga terdiri dari ayah, ibu, kakak, adik, kakek, nenek, atau saudara lainnya.",
        ],
      },
      {
        heading: "Kasih Sayang dalam Keluarga",
        emoji: "❤️",
        paragraphs: [
          "Setiap keluarga punya cara yang berbeda-beda untuk menunjukkan kasih sayang. Contohnya lewat masakan rumahan dan kegiatan makan bersama yang mempererat hubungan keluarga.",
          "Panggilan istimewa untuk orang tua juga jadi tanda kasih sayang, misalnya Papa, Papi, Bapak, atau Ayah untuk ayah, dan Mama, Mami, Bunda, atau Ibu untuk ibu.",
        ],
        bullets: [
          "Dalam film pendek \"Let's Eat\", Ibu (Ma) menunjukkan kasih sayangnya kepada Luan lewat masakan rumahan.",
          "Hubungan mereka yang sempat renggang menjadi dekat kembali lewat kegiatan memasak dan makan bersama.",
        ],
      },
      {
        heading: "Kisah Yesus di Bait Allah",
        emoji: "🙏",
        paragraphs: [
          "Kisah ini terdapat dalam Lukas 2: 41-52. Saat berusia 12 tahun, Yesus pergi ke Yerusalem bersama Maria dan Yusuf.",
          "Yesus sempat terpisah dari orang tua-Nya selama tiga hari. Setelah dicari, Yesus ditemukan sedang berdiskusi dengan para guru di Bait Allah (rumah ibadah).",
          "Setelah kejadian itu, Yesus pulang ke Nazaret dan terus bertumbuh dalam hikmat serta kasih.",
        ],
      },
      {
        heading: "Pesan untuk Kita",
        emoji: "✨",
        bullets: [
          "Orang tua memiliki peran untuk merawat dan menyayangi anak-anaknya.",
          "Yesus memberikan teladan tentang ketaatan kepada orang tua.",
          "Kita diajak untuk senantiasa menghormati bapak dan ibu, serta menyayangi kakak dan adik.",
        ],
      },
    ],
  },
  questions: [
    {
      id: "ag1-01",
      question: "Keluarga merupakan anugerah dari ...",
      options: [
        { id: "a", text: "Tuhan" },
        { id: "b", text: "Sekolah" },
        { id: "c", text: "Teman" },
        { id: "d", text: "Pemerintah" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Keluarga merupakan anugerah Tuhan, tempat kita belajar untuk saling mengasihi.",
    },
    {
      id: "ag1-02",
      question: "Berikut ini yang termasuk anggota keluarga adalah ...",
      options: [
        { id: "a", text: "Ayah, ibu, kakak, adik, kakek, nenek" },
        { id: "b", text: "Guru dan teman sekolah" },
        { id: "c", text: "Tetangga dan satpam" },
        { id: "d", text: "Pedagang di pasar" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Anggota keluarga terdiri dari ayah, ibu, kakak, adik, kakek, nenek, atau saudara lainnya.",
    },
    {
      id: "ag1-03",
      question: "Di dalam keluarga, kita belajar untuk saling ...",
      options: [
        { id: "a", text: "Mengasihi" },
        { id: "b", text: "Bertengkar" },
        { id: "c", text: "Bersaing" },
        { id: "d", text: "Mengabaikan" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Keluarga adalah tempat kita belajar untuk saling mengasihi.",
    },
    {
      id: "ag1-04",
      question: "Salah satu cara keluarga menunjukkan kasih sayang adalah melalui ...",
      options: [
        { id: "a", text: "Masakan rumahan dan makan bersama" },
        { id: "b", text: "Bermain gawai sendiri-sendiri" },
        { id: "c", text: "Saling diam" },
        { id: "d", text: "Pergi tanpa pamit" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Masakan rumahan dan kegiatan makan bersama dapat mempererat hubungan keluarga.",
    },
    {
      id: "ag1-05",
      question: "Panggilan berikut yang BUKAN panggilan sayang untuk ayah adalah ...",
      options: [
        { id: "a", text: "Bunda" },
        { id: "b", text: "Papa" },
        { id: "c", text: "Papi" },
        { id: "d", text: "Bapak" },
      ],
      correctOptionId: "a",
      explanation: "Betul! \"Bunda\" adalah panggilan sayang untuk ibu, bukan ayah.",
    },
    {
      id: "ag1-06",
      question: "Panggilan sayang untuk ibu, di antaranya ...",
      options: [
        { id: "a", text: "Mama, Mami, atau Bunda" },
        { id: "b", text: "Papa, Papi, atau Bapak" },
        { id: "c", text: "Kakak dan Adik" },
        { id: "d", text: "Kakek dan Nenek" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Mama, Mami, atau Bunda adalah beberapa panggilan sayang untuk ibu.",
    },
    {
      id: "ag1-07",
      question: "Dalam film pendek \"Let's Eat\", Ibu (Ma) menunjukkan kasih sayangnya kepada Luan melalui ...",
      options: [
        { id: "a", text: "Masakan rumahan" },
        { id: "b", text: "Uang jajan" },
        { id: "c", text: "Surat" },
        { id: "d", text: "Hadiah mahal" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Hubungan Ma dan Luan yang sempat renggang menjadi dekat kembali melalui aktivitas memasak dan makan bersama.",
    },
    {
      id: "ag1-08",
      question: "Kisah Yesus di Bait Allah terdapat dalam Alkitab pada kitab ...",
      options: [
        { id: "a", text: "Lukas" },
        { id: "b", text: "Kejadian" },
        { id: "c", text: "Mazmur" },
        { id: "d", text: "Wahyu" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Kisah ini terdapat dalam Lukas 2: 41-52.",
    },
    {
      id: "ag1-09",
      question: "Saat kisah Yesus di Bait Allah terjadi, usia Yesus adalah ...",
      options: [
        { id: "a", text: "12 tahun" },
        { id: "b", text: "7 tahun" },
        { id: "c", text: "18 tahun" },
        { id: "d", text: "30 tahun" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Saat berusia 12 tahun, Yesus pergi ke Yerusalem bersama Maria dan Yusuf.",
    },
    {
      id: "ag1-10",
      question: "Yesus pergi ke Yerusalem bersama ...",
      options: [
        { id: "a", text: "Maria dan Yusuf" },
        { id: "b", text: "Kakek dan nenek" },
        { id: "c", text: "Murid-murid-Nya" },
        { id: "d", text: "Teman-teman sekolah" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Yesus pergi ke Yerusalem bersama orang tua-Nya, Maria dan Yusuf.",
    },
    {
      id: "ag1-11",
      question: "Yesus sempat terpisah dari orang tua-Nya selama ...",
      options: [
        { id: "a", text: "Tiga hari" },
        { id: "b", text: "Satu hari" },
        { id: "c", text: "Seminggu" },
        { id: "d", text: "Sebulan" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Setelah sempat terpisah selama tiga hari, orang tua-Nya menemukan Yesus.",
    },
    {
      id: "ag1-12",
      question: "Yesus ditemukan orang tua-Nya sedang berada di ...",
      options: [
        { id: "a", text: "Bait Allah (rumah ibadah)" },
        { id: "b", text: "Pasar" },
        { id: "c", text: "Sungai Yordan" },
        { id: "d", text: "Rumah nelayan" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Yesus ditemukan sedang berdiskusi dengan para guru di Bait Allah (rumah ibadah).",
    },
    {
      id: "ag1-13",
      question: "Saat ditemukan di Bait Allah, Yesus sedang ...",
      options: [
        { id: "a", text: "Berdiskusi dengan para guru" },
        { id: "b", text: "Tidur" },
        { id: "c", text: "Bermain" },
        { id: "d", text: "Berdagang" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Yesus sedang berdiskusi dengan para guru di rumah ibadah.",
    },
    {
      id: "ag1-14",
      question: "Setelah ditemukan di Bait Allah, Yesus kembali pulang ke ...",
      options: [
        { id: "a", text: "Nazaret" },
        { id: "b", text: "Betlehem" },
        { id: "c", text: "Mesir" },
        { id: "d", text: "Roma" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Yesus pulang ke Nazaret dan terus bertumbuh dalam hikmat serta kasih.",
    },
    {
      id: "ag1-15",
      question: "Di Nazaret, Yesus terus bertumbuh dalam ...",
      options: [
        { id: "a", text: "Hikmat serta kasih" },
        { id: "b", text: "Kekayaan" },
        { id: "c", text: "Kekuasaan" },
        { id: "d", text: "Ketenaran" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Yesus terus bertumbuh dalam hikmat serta kasih.",
    },
    {
      id: "ag1-16",
      question: "Kisah Yesus di Bait Allah mengajarkan kepada kita tentang ...",
      options: [
        { id: "a", text: "Ketaatan kepada orang tua" },
        { id: "b", text: "Ketidakpedulian" },
        { id: "c", text: "Kesombongan" },
        { id: "d", text: "Balas dendam" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Yesus memberikan teladan tentang ketaatan kepada orang tua-Nya, Maria dan Yusuf.",
    },
    {
      id: "ag1-17",
      question: "Sikap yang tepat terhadap orang tua adalah ...",
      options: [
        { id: "a", text: "Menghormati bapak dan ibu" },
        { id: "b", text: "Membantah perkataan orang tua" },
        { id: "c", text: "Mengabaikan nasihat orang tua" },
        { id: "d", text: "Bersikap kasar" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Kita diajak untuk senantiasa menghormati bapak dan ibu.",
    },
    {
      id: "ag1-18",
      question: "Sikap yang tepat terhadap kakak dan adik adalah ...",
      options: [
        { id: "a", text: "Saling menyayangi" },
        { id: "b", text: "Saling bertengkar" },
        { id: "c", text: "Saling mengejek" },
        { id: "d", text: "Saling mendiamkan" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Kita diajak untuk menyayangi kakak dan adik.",
    },
    {
      id: "ag1-19",
      question: "Peran orang tua dalam keluarga adalah ...",
      options: [
        { id: "a", text: "Merawat dan menyayangi anak-anaknya" },
        { id: "b", text: "Bekerja tanpa memedulikan anak" },
        { id: "c", text: "Menyerahkan semua tugas ke sekolah" },
        { id: "d", text: "Membiarkan anak sendirian" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Orang tua memiliki peran untuk merawat dan menyayangi anak-anaknya.",
    },
    {
      id: "ag1-20",
      question: "Pesan utama dari kisah Yesus di Bait Allah dan kasih sayang keluarga adalah ...",
      options: [
        { id: "a", text: "Menghormati orang tua serta menyayangi kakak dan adik" },
        { id: "b", text: "Bermain sepanjang hari" },
        { id: "c", text: "Selalu meminta hadiah" },
        { id: "d", text: "Tidak perlu mendengarkan nasihat orang tua" },
      ],
      correctOptionId: "a",
      explanation: "Betul! Meneladani Yesus yang taat kepada Maria dan Yusuf, kita diharapkan mau menghormati orang tua serta menyayangi kakak dan adik.",
    },
  ],
};

export default chapter;
