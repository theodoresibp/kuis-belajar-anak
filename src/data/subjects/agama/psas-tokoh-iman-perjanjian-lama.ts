import type { QuizChapter, QuizQuestion } from "@/types/quiz";

const A = "/assets/agama";

type Q = [question: string, correct: string, wrong: string[], explanation: string, image?: readonly [src: string, alt: string]];

const IMG = {
  bahtera: [`${A}/nuh-membangun-bahtera.jpeg`, "Lukisan orang-orang membangun kerangka kapal kayu yang besar"],
  hewan: [`${A}/nuh-bahtera-dan-hewan.jpeg`, "Lukisan hewan-hewan berbaris menuju bahtera besar"],
  syukur: [`${A}/nuh-bersyukur-setelah-air-bah.jpeg`, "Lukisan Nuh dan keluarganya berdoa di depan bahtera setelah air bah"],
  abraham: [`${A}/abraham-berangkat-ke-kanaan.jpeg`, "Lukisan Abraham berjalan bersama keluarga, unta, dan domba-dombanya"],
  janji: [`${A}/allah-berjanji-kepada-abraham.jpeg`, "Lukisan Abraham bersujud mendengarkan Allah yang tampak di langit"],
  bintang: [`${A}/langit-penuh-bintang.png`, "Ilustrasi langit malam yang penuh bintang"],
  jumatBersih: [`${A}/jumat-bersih.jpeg`, "Anak-anak membersihkan lingkungan sekolah bersama-sama"],
  kerjaKelompok: [`${A}/kerja-kelompok.jpeg`, "Anak-anak mengerjakan tugas kelompok bersama"],
  menara: [`${A}/kerja-sama-menara-balok.jpeg`, "Anak-anak bekerja sama menyusun menara balok"],
  bersihRumah: [`${A}/keluarga-membersihkan-rumah.jpeg`, "Keluarga membersihkan rumah bersama-sama"],
  bantuTeman: [`${A}/membantu-teman-belajar.jpeg`, "Anak membantu temannya belajar"],
  berbagi: [`${A}/berbagi-makanan.jpeg`, "Anak-anak berbagi makanan"],
  nasihat: [`${A}/mendengarkan-nasihat-orang-tua.jpeg`, "Anak mendengarkan nasihat ibunya"],
} as const satisfies Record<string, readonly [string, string]>;

const LETTERS = ["a", "b", "c", "d"];

const raw: Q[] = [
  // ===== Kisah Nabi Nuh dan Air Bah =====
  ["Pada zaman Nabi Nuh, banyak manusia melakukan ... dan tidak menaati Allah.", "Kejahatan", ["Kebaikan", "Doa", "Kerja sama"], "Betul! Pada zaman Nabi Nuh, banyak manusia melakukan kejahatan."],
  ["Nuh adalah orang yang ... kepada Allah.", "Taat dan setia", ["Malas dan lupa", "Suka membantah", "Jahat dan sombong"], "Betul! Nuh adalah orang yang taat, setia, dan melakukan kehendak Tuhan."],
  ["Allah mendatangkan air bah untuk ...", "Membersihkan bumi dari kejahatan manusia", ["Menyiram tanaman", "Mengisi kolam ikan", "Membuat sungai baru"], "Betul! Air bah didatangkan untuk membersihkan bumi dari kejahatan manusia.", IMG.bahtera],
  ["Perhatikan gambar! Allah memerintahkan Nuh membuat sebuah ...", "Bahtera atau kapal besar", ["Rumah besar", "Menara tinggi", "Sumur dalam"], "Betul! Allah memerintahkan Nuh membuat bahtera atau kapal besar.", IMG.bahtera],
  ["Nuh membangun bahtera bersama ...", "Keluarganya", ["Raja-raja", "Orang-orang jahat", "Para tentara"], "Betul! Nuh menaati perintah Allah dan membangun bahtera bersama keluarganya."],
  ["Perhatikan gambar! Selain keluarganya, Nuh membawa ... ke dalam bahtera.", "Hewan-hewan", ["Mainan", "Emas dan perak", "Orang-orang jahat"], "Betul! Nuh membawa keluarganya dan hewan-hewan ke dalam bahtera.", IMG.hewan],
  ["Air bah turun selama ... hari.", "40", ["10", "7", "100"], "Betul! Air bah turun selama 40 hari."],
  ["Nuh memiliki ... orang anak laki-laki.", "Tiga", ["Dua", "Empat", "Lima"], "Betul! Nuh memiliki tiga orang anak laki-laki."],
  ["Nama anak-anak laki-laki Nuh adalah ...", "Sem, Ham, dan Yafet", ["Esau, Yakub, dan Ishak", "Sem, Abraham, dan Sarai", "Ham, Yakub, dan Ribka"], "Betul! Anak-anak Nuh adalah Sem, Ham, dan Yafet."],
  ["Berikut ini yang BUKAN anak Nuh adalah ...", "Yakub", ["Sem", "Ham", "Yafet"], "Betul! Yakub adalah anak Ishak, bukan anak Nuh."],
  ["Kisah Nabi Nuh terdapat dalam Kitab ...", "Kejadian bab 6–8", ["Keluaran bab 1–3", "Mazmur bab 23", "Injil Matius bab 5"], "Betul! Kisah Nuh terdapat dalam Kitab Kejadian bab 6–8."],
  ["Perhatikan gambar! Setelah selamat dari air bah, Nuh dan keluarganya ...", "Bersyukur kepada Tuhan", ["Bertengkar", "Membongkar bahtera", "Melupakan Tuhan"], "Betul! Kita juga harus rajin berdoa dan bersyukur kepada Tuhan seperti Nuh.", IMG.syukur],
  ["Kisah Nabi Nuh mengajarkan kita untuk ...", "Taat kepada perintah Allah", ["Mengikuti perbuatan buruk teman", "Malas mengerjakan tugas", "Lupa berdoa"], "Betul! Kisah Nuh mengajarkan kita taat kepada perintah Allah."],
  ["Teman-teman mengajak Doni menyontek saat ulangan. Sikap Doni yang meneladan Nuh adalah ...", "Tidak ikut menyontek", ["Ikut menyontek", "Memberi contekan", "Melapor sambil mengejek"], "Betul! Seperti Nuh, kita tidak mengikuti perbuatan buruk orang lain."],
  ["Rina diejek teman, tetapi ia tetap berbuat baik. Rina meneladan sikap ...", "Nuh yang tetap setia berbuat baik", ["Esau yang tergesa-gesa", "Orang-orang jahat zaman Nuh", "Teman yang mengejek"], "Betul! Nuh tetap hidup dekat dengan Allah walau banyak orang berbuat jahat."],
  // ===== Menjaga Lingkungan =====
  ["Salah satu cara mencegah banjir adalah ...", "Tidak membuang sampah ke sungai", ["Membuang sampah ke selokan", "Menebang pohon sembarangan", "Menutup saluran air"], "Betul! Tidak membuang sampah ke sungai atau selokan dapat mencegah banjir."],
  ["Perhatikan gambar! Membersihkan lingkungan sekolah bersama-sama dapat ...", "Mencegah banjir dan menjaga kebersihan", ["Membuat banjir", "Membuat kelas kotor", "Membuang waktu"], "Betul! Menjaga kebersihan lingkungan dapat mencegah banjir.", IMG.jumatBersih],
  ["Perbuatan yang dapat menyebabkan banjir adalah ...", "Menebang pohon sembarangan", ["Menanam pohon", "Membersihkan saluran air", "Membuang sampah pada tempatnya"], "Betul! Menebang pohon sembarangan dapat menyebabkan banjir."],
  ["Menjaga lingkungan merupakan salah satu cara kita ...", "Bersyukur atas ciptaan Allah", ["Bermain-main", "Menghindari teman", "Membuang sampah"], "Betul! Menjaga lingkungan adalah cara bersyukur atas ciptaan Allah."],
  // ===== Abraham =====
  ["Abraham dikenal sebagai ...", "Bapa Orang Beriman", ["Raja Israel", "Pembuat bahtera", "Anak sulung Ishak"], "Betul! Abraham dikenal sebagai Bapa Orang Beriman.", IMG.janji],
  ["Allah meminta Abraham untuk ...", "Meninggalkan negerinya dan pergi ke negeri yang ditunjukkan Allah", ["Membuat bahtera", "Menjadi raja", "Tinggal di rumah saja"], "Betul! Allah meminta Abraham pergi ke negeri yang akan ditunjukkan-Nya.", IMG.abraham],
  ["Perhatikan gambar! Abraham berangkat karena ia ... perintah Tuhan.", "Menaati", ["Menolak", "Melupakan", "Menertawakan"], "Betul! Abraham menaati perintah Tuhan dan percaya Allah menuntunnya.", IMG.abraham],
  ["Istri Abraham bernama ...", "Sarai", ["Ribka", "Maria", "Ester"], "Betul! Istri Abraham bernama Sarai."],
  ["Abraham percaya bahwa Allah akan ... perjalanan hidupnya.", "Menuntun dan menyertai", ["Meninggalkan", "Menghalangi", "Melupakan"], "Betul! Abraham percaya Allah akan menuntun dan menyertai perjalanannya."],
  ["Allah memberikan janji kepada Abraham karena ...", "Kesetiaan dan kepercayaannya", ["Ia sangat kaya", "Ia sangat kuat", "Ia pandai berperang"], "Betul! Allah memberi janji karena kesetiaan dan kepercayaan Abraham."],
  ["Perhatikan gambar! Allah berjanji memberikan Abraham keturunan yang ...", "Banyak, seperti bintang di langit", ["Sedikit", "Hanya satu orang", "Tidak ada"], "Betul! Allah menjanjikan keturunan yang banyak kepada Abraham.", IMG.bintang],
  ["Berikut ini yang termasuk janji Allah kepada Abraham, KECUALI ...", "Abraham akan membuat bahtera", ["Memberikan keturunan yang banyak", "Menjadikan bangsa yang besar", "Memberkati Abraham"], "Betul! Membuat bahtera adalah perintah Allah kepada Nuh, bukan janji kepada Abraham."],
  ["Allah berjanji akan menjadikan Abraham ...", "Bangsa yang besar", ["Orang miskin", "Pembuat kapal", "Raja yang jahat"], "Betul! Allah akan menjadikan Abraham bangsa yang besar."],
  ["Sikap baik Abraham yang dapat kita contoh adalah ...", "Taat dan setia kepada Allah", ["Ragu-ragu kepada Allah", "Malas berdoa", "Suka membantah"], "Betul! Abraham taat, setia, dan percaya kepada janji Allah.", IMG.janji],
  ["Perhatikan gambar! Contoh tindakan yang menyenangkan hati Allah adalah ...", "Mendengarkan nasihat orang tua", ["Membantah orang tua", "Berbohong", "Malas belajar"], "Betul! Menghormati dan mendengarkan orang tua menyenangkan hati Allah.", IMG.nasihat],
  // ===== Ishak, Esau, dan Yakub =====
  ["Ishak adalah anak dari ...", "Abraham dan Sarai", ["Nuh dan istrinya", "Esau dan Ribka", "Yakub dan Ribka"], "Betul! Ishak adalah anak Abraham dan Sarai."],
  ["Ishak pernah tinggal di Gerar, kemudian menetap di ...", "Bersyeba", ["Mesir", "Betlehem", "Nazaret"], "Betul! Ishak menetap di Bersyeba."],
  ["Teladan dari Ishak adalah ...", "Tetap percaya kepada Allah ketika menghadapi kesulitan", ["Mudah menyerah", "Marah saat kesulitan", "Melupakan Allah"], "Betul! Ishak tetap percaya kepada Allah ketika menghadapi kesulitan."],
  ["Esau dan Yakub adalah anak kembar dari ...", "Ishak dan Ribka", ["Abraham dan Sarai", "Nuh dan istrinya", "Sem dan Ham"], "Betul! Esau dan Yakub adalah anak kembar Ishak dan Ribka."],
  ["Ketika lahir, tubuh Esau berwarna ... dan berbulu.", "Merah", ["Putih", "Hijau", "Biru"], "Betul! Tubuh Esau berwarna merah dan berbulu."],
  ["Esau memiliki hak kesulungan karena ...", "Ia lahir lebih dahulu", ["Ia paling kuat", "Ia paling pintar", "Ia lahir paling akhir"], "Betul! Esau lahir lebih dahulu sehingga ia memiliki hak kesulungan."],
  ["Esau pulang dalam keadaan sangat lapar dan meminta makanan berupa ... kepada Yakub.", "Kacang merah", ["Roti tawar", "Ikan bakar", "Buah apel"], "Betul! Esau meminta makanan kacang merah kepada Yakub."],
  ["Yakub mau memberikan makanan kepada Esau dengan syarat ...", "Esau menyerahkan hak kesulungannya", ["Esau memberinya uang", "Esau membersihkan rumah", "Esau bernyanyi"], "Betul! Yakub meminta hak kesulungan Esau."],
  ["Hak kesulungan Esau akhirnya diterima oleh ...", "Yakub", ["Ishak", "Abraham", "Sem"], "Betul! Yakub, adik Esau, menerima hak kesulungan."],
  ["Pesan dari kisah Esau dan Yakub adalah ...", "Berpikir dengan baik sebelum mengambil keputusan", ["Menuruti keinginan sesaat", "Menukar barang berharga dengan makanan", "Tidak perlu berpikir"], "Betul! Jangan mudah mengorbankan sesuatu yang berharga demi keinginan sesaat."],
  // ===== Hidup Rukun dan Bekerja Sama =====
  ["Kegiatan yang dilakukan bersama-sama untuk mencapai tujuan tertentu disebut ...", "Kerja sama", ["Bertengkar", "Bermalas-malasan", "Egois"], "Betul! Itu adalah pengertian kerja sama.", IMG.menara],
  ["Perhatikan gambar! Kegiatan tersebut adalah contoh kerja sama di ...", "Rumah", ["Pasar", "Kebun binatang", "Jalan raya"], "Betul! Membantu orang tua membersihkan rumah adalah contoh kerja sama.", IMG.bersihRumah],
  ["Manfaat kerja sama adalah ...", "Pekerjaan menjadi lebih cepat selesai", ["Pekerjaan menjadi lebih lama", "Teman menjadi musuh", "Tugas menjadi berat"], "Betul! Kerja sama membuat pekerjaan lebih cepat selesai dan terasa ringan."],
  ["Perhatikan gambar! Sikap baik saat bekerja kelompok adalah ...", "Mendengarkan pendapat teman", ["Mau menang sendiri", "Mengganggu teman", "Tidak mau membantu"], "Betul! Saat bekerja sama kita harus saling menghargai dan mendengarkan pendapat teman.", IMG.kerjaKelompok],
  ["Berikut ini sikap yang harus dihindari dalam kerja sama adalah ...", "Malas dan egois", ["Saling membantu", "Mau berbagi tugas", "Bertanggung jawab"], "Betul! Malas dan egois adalah sikap tidak terpuji dalam kerja sama."],
  ["Salah satu contoh kerja sama di sekolah adalah ...", "Piket kelas sesuai jadwal", ["Bermain sendiri saat piket", "Pulang sebelum piket", "Mencoret-coret meja"], "Betul! Piket kelas adalah contoh kerja sama di sekolah."],
  ["Jika ada siswa yang tidak mau piket, maka ...", "Pekerjaan menjadi lebih berat bagi temannya", ["Kelas menjadi lebih bersih", "Pekerjaan cepat selesai", "Semua teman senang"], "Betul! Jika ada yang tidak piket, pekerjaan teman-temannya menjadi lebih berat."],
  // ===== Yesus Mengajarkan Kasih =====
  ["Yesus menunjukkan kasih kepada semua orang dengan cara ...", "Menyembuhkan orang sakit dan menghibur orang sedih", ["Memarahi orang sakit", "Menjauhi orang yang sedih", "Tidak peduli kepada sesama"], "Betul! Yesus mengajarkan kasih dengan menyembuhkan orang sakit dan menghibur orang sedih."],
  ["Perhatikan gambar! Membantu teman yang kesulitan belajar adalah cara meneladani ...", "Yesus yang mengasihi sesama", ["Esau yang tergesa-gesa", "Orang-orang jahat zaman Nuh", "Teman yang egois"], "Betul! Menolong teman yang kesulitan adalah cara meneladani kasih Yesus.", IMG.bantuTeman],
  ["Temanmu berbuat salah lalu meminta maaf. Sikap yang meneladani Yesus adalah ...", "Mengampuni teman", ["Mengejek teman", "Tidak mau berteman lagi", "Membalas perbuatannya"], "Betul! Yesus mengajarkan kita untuk mengampuni teman yang bersalah."],
];

const questions: QuizQuestion[] = raw.map(([question, correct, wrong, explanation, image], i) => ({
  id: `psas-tokoh-iman-${String(i + 1).padStart(2, "0")}`,
  question,
  ...(image ? { image: image[0], imageAlt: image[1] } : {}),
  options: [correct, ...wrong].map((text, j) => ({ id: LETTERS[j], text })),
  correctOptionId: "a",
  explanation,
}));

const chapter: QuizChapter = {
  id: "psas-tokoh-iman-perjanjian-lama",
  title: "PSAS: Tokoh-Tokoh Iman Perjanjian Lama",
  subtitle: "Latihan PSAS Ganjil: Nuh, Abraham, Ishak, Esau & Yakub, kerja sama, dan Yesus mengajarkan kasih",
  emoji: "📖",
  category: "PSAS",
  gradient: "from-violet-400 via-purple-300 to-fuchsia-300",
  material: {
    summary:
      "Ringkasan untuk persiapan PSAS Ganjil: kisah Nabi Nuh dan air bah, Abraham Bapa Orang Beriman, kisah Ishak, Esau, dan Yakub, hidup rukun dan bekerja sama, serta Yesus yang mengajarkan kasih.",
    sections: [
      {
        heading: "Kisah Nabi Nuh dan Air Bah",
        emoji: "🚢",
        images: [
          { src: IMG.bahtera[0], alt: IMG.bahtera[1], caption: "Nuh membuat bahtera" },
          { src: IMG.hewan[0], alt: IMG.hewan[1], caption: "Hewan-hewan masuk ke bahtera" },
        ],
        paragraphs: [
          "Pada zaman Nabi Nuh, banyak manusia melakukan kejahatan dan tidak menaati Allah. Namun, Nuh tetap hidup dekat dengan Allah. Nuh adalah orang yang taat, setia, dan melakukan kehendak Tuhan.",
          "Allah mendatangkan air bah untuk membersihkan bumi dari kejahatan manusia. Allah memerintahkan Nuh membuat bahtera (kapal besar). Nuh menaati perintah Allah dan membangun bahtera bersama keluarganya.",
          "Kisah Nuh terdapat dalam Kitab Kejadian bab 6–8.",
        ],
        bullets: [
          "Nuh membawa keluarganya dan hewan-hewan ke dalam bahtera.",
          "Air bah turun selama 40 hari.",
          "Allah menyelamatkan Nuh dan keluarganya.",
          "Tiga anak laki-laki Nuh: Sem, Ham, dan Yafet.",
        ],
      },
      {
        heading: "Pesan dari Kisah Nabi Nuh",
        emoji: "🙏",
        image: IMG.syukur[0],
        imageAlt: IMG.syukur[1],
        bullets: [
          "Taat kepada perintah Allah dan selalu berbuat baik.",
          "Tidak mengikuti perbuatan buruk orang lain (misalnya tidak menyontek).",
          "Melaksanakan tugas dengan sungguh-sungguh.",
          "Rajin berdoa dan bersyukur kepada Tuhan.",
          "Tetap berbuat baik meskipun diejek teman.",
        ],
      },
      {
        heading: "Menjaga Lingkungan agar Terhindar dari Banjir",
        emoji: "🌳",
        image: IMG.jumatBersih[0],
        imageAlt: IMG.jumatBersih[1],
        bullets: [
          "Tidak membuang sampah ke sungai atau selokan.",
          "Membersihkan saluran air.",
          "Menanam dan merawat pohon, tidak menebang pohon sembarangan.",
          "Menjaga kebersihan rumah dan sekolah.",
          "Menjaga lingkungan adalah cara bersyukur atas ciptaan Allah.",
        ],
      },
      {
        heading: "Abraham: Bapa Orang Beriman",
        emoji: "🐪",
        image: IMG.abraham[0],
        imageAlt: IMG.abraham[1],
        paragraphs: [
          "Allah meminta Abraham meninggalkan negeri, keluarga, dan sanak saudaranya untuk pergi ke negeri yang akan ditunjukkan Allah. Abraham menaati perintah Tuhan dan percaya Allah akan menuntun dan menyertainya.",
          "Abraham ditemani oleh istrinya, yaitu Sarai.",
        ],
        bullets: [
          "Sikap Abraham: taat, setia, percaya kepada janji Allah, berani mengikuti kehendak Tuhan, rajin berdoa dan bersyukur.",
        ],
      },
      {
        heading: "Janji Allah kepada Abraham",
        emoji: "⭐",
        images: [
          { src: IMG.janji[0], alt: IMG.janji[1], caption: "Abraham mendengarkan janji Allah" },
          { src: IMG.bintang[0], alt: IMG.bintang[1], caption: "Keturunan yang banyak" },
        ],
        bullets: [
          "Allah akan memberikan keturunan yang banyak.",
          "Allah akan menjadikan Abraham bangsa yang besar.",
          "Allah akan memberkati Abraham.",
        ],
      },
      {
        heading: "Kisah Ishak, Esau, dan Yakub",
        emoji: "🍲",
        paragraphs: [
          "Ishak adalah anak Abraham dan Sarai. Ishak pernah tinggal di Gerar, lalu menetap di Bersyeba. Teladan Ishak: tetap percaya kepada Allah ketika menghadapi kesulitan.",
          "Esau dan Yakub adalah anak kembar Ishak dan Ribka. Esau lahir lebih dahulu, tubuhnya merah dan berbulu, sehingga ia memiliki hak kesulungan.",
          "Suatu hari Esau pulang sangat lapar dan meminta kacang merah kepada Yakub. Yakub mau memberi dengan syarat Esau menyerahkan hak kesulungannya, dan Esau menyetujuinya.",
        ],
        bullets: [
          "Pesan: berpikirlah dengan baik sebelum mengambil keputusan. Jangan mengorbankan sesuatu yang berharga demi keinginan sesaat.",
        ],
      },
      {
        heading: "Hidup Rukun dan Bekerja Sama",
        emoji: "🤝",
        images: [
          { src: IMG.menara[0], alt: IMG.menara[1], caption: "Bermain dalam kelompok" },
          { src: IMG.bersihRumah[0], alt: IMG.bersihRumah[1], caption: "Membantu membersihkan rumah" },
        ],
        paragraphs: [
          "Kerja sama adalah kegiatan yang dilakukan bersama-sama untuk mencapai tujuan tertentu. Contoh di sekolah: piket kelas sesuai jadwal.",
        ],
        bullets: [
          "Manfaat: pekerjaan lebih cepat selesai dan terasa ringan, mempererat persahabatan, melatih tanggung jawab.",
          "Sikap baik: saling menghargai, saling membantu, berbagi tugas, mendengarkan pendapat teman, tidak memilih-milih teman.",
          "Sikap yang dihindari: malas, egois, usil, tidak mau membantu, tidak melaksanakan tugas, memarahi teman.",
        ],
      },
      {
        heading: "Yesus Mengajarkan Kasih",
        emoji: "💜",
        image: IMG.bantuTeman[0],
        imageAlt: IMG.bantuTeman[1],
        paragraphs: [
          "Yesus menunjukkan kasih dengan menyembuhkan orang sakit, menghibur orang sedih, dan menolong orang yang membutuhkan.",
        ],
        bullets: [
          "Menolong dan menghibur teman, berbagi dengan orang lain.",
          "Menghormati orang tua dan guru, tidak mengejek teman.",
          "Mengampuni teman yang bersalah.",
          "Kasih diwujudkan melalui tindakan nyata, bukan hanya perkataan.",
        ],
      },
    ],
  },
  questions,
};

export default chapter;
