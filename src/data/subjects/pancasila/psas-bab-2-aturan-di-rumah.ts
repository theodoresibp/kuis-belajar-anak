import type { QuizChapter, QuizQuestion } from "@/types/quiz";

const P = "/assets/pancasila";
const AG = "/assets/agama";

type Q = [question: string, correct: string, wrong: string[], explanation: string, image?: readonly [src: string, alt: string]];

const IMG = {
  diskusi: [`${P}/rumah-sila-4-berdiskusi-keluarga.jpeg`, "Keluarga berdiskusi bersama di rumah"],
  makan: [`${P}/rumah-sila-3-makan-bersama.jpeg`, "Keluarga makan bersama di rumah"],
  bantuKeluarga: [`${P}/rumah-sila-2-membantu-keluarga.jpeg`, "Anak membantu pekerjaan keluarga di rumah"],
  belajar: [`${P}/rumah-sila-5-rajin-belajar.jpeg`, "Anak rajin belajar di rumah"],
  sopan: [`${P}/rumah-sila-2-berkata-sopan.jpeg`, "Anak berkata sopan kepada orang tua"],
  bersihRumah: [`${AG}/keluarga-membersihkan-rumah.jpeg`, "Keluarga membersihkan rumah bersama"],
  rukun: [`${AG}/bermain-bersama-rukun.jpeg`, "Anak-anak bermain bersama dengan rukun"],
  tempatTidur: [`${AG}/merapikan-tempat-tidur.jpeg`, "Anak merapikan tempat tidur"],
  nasihat: [`${AG}/mendengarkan-nasihat-orang-tua.jpeg`, "Anak mendengarkan nasihat orang tua"],
  cuciPiring: [`${AG}/membantu-ibu-mencuci-piring.jpeg`, "Anak membantu ibu mencuci piring"],
  berdoa: [`${AG}/keluarga-berdoa-sebelum-makan.jpeg`, "Keluarga berdoa sebelum makan"],
} as const satisfies Record<string, readonly [string, string]>;

const LETTERS = ["a", "b", "c", "d"];

const raw: Q[] = [
  // ===== Siapa yang membuat aturan & tujuannya =====
  ["Di rumah, aturan dibuat oleh ...", "Ayah dan ibu", ["Teman sekelas", "Pak RT", "Penjual di pasar"], "Betul! Aturan di rumah dibuat oleh ayah dan ibu."],
  ["Aturan di rumah harus disepakati oleh ...", "Seluruh anggota keluarga", ["Ayah saja", "Adik saja", "Tetangga sebelah"], "Betul! Aturan disepakati oleh seluruh anggota keluarga."],
  ["Perhatikan gambar! Keluarga sedang berkumpul untuk ... aturan di rumah.", "Menyepakati", ["Melupakan", "Melanggar", "Menyembunyikan"], "Betul! Aturan di rumah disepakati bersama oleh seluruh anggota keluarga.", IMG.diskusi],
  ["Aturan dibuat untuk mengatur ... seseorang.", "Perilaku", ["Tinggi badan", "Warna baju", "Nama"], "Betul! Aturan dibuat untuk mengatur perilaku seseorang."],
  ["Aturan di rumah Tika dan rumah Bima tidak sama. Hal ini karena ...", "Aturan setiap keluarga berbeda-beda", ["Salah satu keluarga salah", "Aturan harus sama di semua rumah", "Tika dan Bima bertengkar"], "Betul! Aturan setiap keluarga berbeda-beda."],
  ["Penerapan aturan di setiap keluarga ...", "Bisa berbeda-beda", ["Pasti sama persis", "Tidak boleh berbeda", "Ditentukan oleh teman"], "Betul! Penerapan aturan dalam keluarga juga berbeda-beda."],
  ["Pernyataan yang BENAR tentang aturan di rumah adalah ...", "Aturan dibuat ayah dan ibu lalu disepakati bersama", ["Aturan dibuat oleh anak paling kecil", "Aturan hanya untuk ayah", "Aturan boleh dilanggar kapan saja"], "Betul! Aturan dibuat oleh ayah dan ibu dan disepakati seluruh keluarga."],
  ["Mematuhi aturan membuat suasana menjadi ...", "Tertib dan teratur", ["Ramai dan kacau", "Kotor dan berantakan", "Sedih dan sepi"], "Betul! Mematuhi aturan membuat suasana tertib dan teratur."],
  // ===== Manfaat patuh aturan =====
  ["Perhatikan gambar! Keluarga yang patuh aturan kebersihan membuat rumah menjadi ...", "Bersih dan nyaman", ["Kotor dan bau", "Berantakan", "Penuh sampah"], "Betul! Patuh aturan membuat rumah menjadi bersih dan nyaman.", IMG.bersihRumah],
  ["Patuh pada aturan di rumah melatih anggota keluarga agar ...", "Disiplin", ["Malas", "Pemarah", "Suka terlambat"], "Betul! Mematuhi aturan melatih anggota keluarga agar disiplin."],
  ["Jika anak-anak patuh pada aturan, orang tua akan merasa ...", "Tenang", ["Marah", "Khawatir", "Kecewa"], "Betul! Patuh pada aturan membuat orang tua merasa tenang."],
  ["Perhatikan gambar! Anak-anak bermain dengan rukun. Keluarga menjadi rukun karena ...", "Semua anggota keluarga patuh aturan", ["Semua berbuat sesuka hati", "Tidak ada aturan", "Saling mengejek"], "Betul! Patuh pada aturan membuat keluarga menjadi rukun.", IMG.rukun],
  ["Berikut ini yang termasuk manfaat patuh pada aturan di rumah, KECUALI ...", "Rumah menjadi kotor", ["Rumah bersih dan nyaman", "Orang tua merasa tenang", "Keluarga menjadi rukun"], "Betul! Rumah kotor adalah akibat tidak patuh aturan, bukan manfaat."],
  ["Kata 'disiplin' artinya ...", "Taat dan tepat waktu menjalankan aturan", ["Suka bermalas-malasan", "Sering lupa tugas", "Suka melanggar aturan"], "Betul! Disiplin berarti taat dan tepat waktu menjalankan aturan."],
  ["Perhatikan gambar! Merapikan tempat tidur setiap pagi melatih kita untuk ...", "Disiplin", ["Malas", "Ceroboh", "Egois"], "Betul! Kebiasaan merapikan tempat tidur melatih kita disiplin.", IMG.tempatTidur],
  ["Rani selalu pulang tepat waktu sesuai aturan rumah. Orang tua Rani merasa ...", "Tenang", ["Cemas", "Marah", "Bingung"], "Betul! Patuh aturan membuat orang tua merasa tenang."],
  ["Keluarga Andi jarang bertengkar karena semua patuh pada aturan. Keluarga Andi menjadi ...", "Rukun", ["Berantakan", "Kacau", "Saling bermusuhan"], "Betul! Keluarga yang patuh aturan menjadi rukun."],
  ["Manfaat patuh aturan yang dirasakan oleh orang tua adalah ...", "Merasa tenang", ["Merasa marah", "Merasa khawatir", "Merasa sedih"], "Betul! Orang tua merasa tenang jika anak-anak patuh aturan."],
  // ===== Akibat tidak patuh =====
  ["Tidak patuh pada aturan akan membuat kita ...", "Rugi", ["Untung", "Bahagia", "Dipuji"], "Betul! Tidak patuh pada aturan akan membuat kita rugi."],
  ["Tidak patuh pada aturan kebersihan membuat kita tidak nyaman karena ...", "Rumah menjadi kotor", ["Rumah menjadi wangi", "Rumah menjadi rapi", "Rumah menjadi besar"], "Betul! Tidak patuh aturan kebersihan membuat rumah kotor dan tidak nyaman."],
  ["Sisa makanan yang dibiarkan dapat menimbulkan ...", "Kuman dan bau tak sedap", ["Bunga yang harum", "Udara segar", "Mainan baru"], "Betul! Sisa makanan menimbulkan kuman dan bau tak sedap."],
  ["Sisa makanan yang menimbulkan kuman dapat membuat kita ...", "Sakit", ["Sehat", "Kuat", "Pintar"], "Betul! Kuman dari sisa makanan bisa membuat kita sakit."],
  ["Sisa makanan yang berserakan adalah akibat tidak patuh pada aturan ...", "Makan", ["Tidur", "Bermain", "Berpakaian"], "Betul! Itu akibat tidak patuh pada aturan makan."],
  ["Tidak patuh pada aturan sekolah akan ...", "Mengganggu aktivitas kita di sekolah", ["Membuat nilai selalu bagus", "Membuat guru senang", "Membuat kelas tertib"], "Betul! Tidak patuh aturan sekolah mengganggu aktivitas di sekolah."],
  ["Tidak patuh pada aturan orang tua membuat orang tua ...", "Marah dan khawatir", ["Senang dan bangga", "Tenang dan santai", "Tertawa gembira"], "Betul! Orang tua menjadi marah dan khawatir."],
  ["Perhatikan gambar! Jika anak tidak mau mendengarkan nasihat orang tua, orang tua akan ...", "Khawatir", ["Bangga", "Tenang", "Gembira"], "Betul! Tidak patuh kepada orang tua membuat mereka marah dan khawatir.", IMG.nasihat],
  ["Tono bermain di luar sampai malam tanpa pamit. Orang tua Tono merasa ...", "Khawatir", ["Tenang", "Senang", "Bangga"], "Betul! Tidak patuh pada aturan orang tua membuat mereka khawatir."],
  ["Lina sering terlambat datang ke sekolah. Akibatnya ...", "Kegiatan belajarnya terganggu", ["Lina menjadi juara kelas", "Guru memberi hadiah", "Kelas lebih tertib"], "Betul! Tidak patuh aturan sekolah mengganggu aktivitas di sekolah."],
  ["Dimas tidak pernah membuang sampah ke tempat sampah. Akibatnya rumah menjadi ...", "Kotor dan tidak nyaman", ["Bersih dan rapi", "Wangi", "Nyaman"], "Betul! Tidak patuh aturan kebersihan membuat rumah kotor."],
  ["Sinta tidak menghabiskan makanannya dan membiarkan piringnya di kamar. Akibat yang mungkin terjadi adalah ...", "Muncul kuman dan bau tak sedap", ["Kamar menjadi harum", "Kamar menjadi rapi", "Sinta menjadi kuat"], "Betul! Sisa makanan menimbulkan kuman dan bau tak sedap."],
  // ===== Tanpa aturan =====
  ["Tanpa aturan, anggota keluarga akan berbuat ...", "Sesuka hati", ["Tertib", "Disiplin", "Sopan"], "Betul! Tanpa aturan, anggota keluarga akan berbuat sesuka hati."],
  ["Jika rumah tidak memiliki aturan, akan muncul banyak ...", "Masalah", ["Hadiah", "Pujian", "Kebaikan"], "Betul! Tanpa aturan, banyak masalah muncul di rumah."],
  ["Tanpa aturan, anggota keluarga tidak saling ...", "Menghormati", ["Bertengkar", "Berteriak", "Mengejek"], "Betul! Tanpa aturan, anggota keluarga tidak saling menghormati."],
  ["Berikut ini yang terjadi jika rumah tanpa aturan adalah ...", "Rumah menjadi kotor", ["Rumah menjadi rapi", "Keluarga menjadi rukun", "Orang tua merasa tenang"], "Betul! Tanpa aturan, rumah menjadi kotor."],
  ["Mengapa setiap keluarga perlu memiliki aturan?", "Agar keluarga tertib, teratur, dan rukun", ["Agar anak bisa berbuat sesuka hati", "Agar rumah berantakan", "Agar sering bertengkar"], "Betul! Aturan membuat keluarga tertib, teratur, dan rukun."],
  // ===== Contoh aturan & sikap =====
  ["Perhatikan gambar! Keluarga makan bersama. Aturan ini membuat keluarga menjadi ...", "Rukun dan akrab", ["Saling bermusuhan", "Jarang bertemu", "Berantakan"], "Betul! Makan bersama adalah aturan yang membuat keluarga rukun.", IMG.makan],
  ["Perhatikan gambar! Anak yang belajar sesuai jam belajar di rumah menunjukkan sikap ...", "Disiplin", ["Malas", "Melanggar aturan", "Tidak peduli"], "Betul! Belajar sesuai jadwal adalah sikap disiplin.", IMG.belajar],
  ["Perhatikan gambar! Membantu ibu mencuci piring adalah contoh ...", "Mematuhi aturan di rumah", ["Melanggar aturan", "Berbuat sesuka hati", "Bermalas-malasan"], "Betul! Membantu pekerjaan rumah adalah contoh mematuhi aturan.", IMG.cuciPiring],
  ["Perhatikan gambar! Kebiasaan keluarga berdoa sebelum makan termasuk ...", "Aturan di rumah", ["Aturan di jalan raya", "Aturan bermain bola", "Aturan di pasar"], "Betul! Berdoa sebelum makan adalah salah satu aturan di rumah.", IMG.berdoa],
  ["Perhatikan gambar! Anak membantu pekerjaan keluarga di rumah. Sikap ini membuat orang tua merasa ...", "Senang dan tenang", ["Marah", "Khawatir", "Kecewa"], "Betul! Anak yang patuh dan membantu membuat orang tua tenang.", IMG.bantuKeluarga],
  ["Perhatikan gambar! Berkata sopan kepada orang tua adalah sikap ...", "Patuh dan menghormati orang tua", ["Melawan orang tua", "Tidak sopan", "Berbuat sesuka hati"], "Betul! Berkata sopan menunjukkan kita menghormati orang tua.", IMG.sopan],
  ["Contoh aturan di rumah adalah ...", "Merapikan mainan setelah bermain", ["Bermain sampai larut malam", "Membuang sampah sembarangan", "Tidak mau mandi"], "Betul! Merapikan mainan setelah bermain adalah contoh aturan di rumah."],
  ["Contoh aturan makan di rumah adalah ...", "Menghabiskan makanan dan mencuci piring", ["Makan sambil berlari", "Membuang makanan", "Meninggalkan piring di kasur"], "Betul! Menghabiskan makanan dan mencuci piring adalah aturan makan."],
  ["Sikap yang menunjukkan patuh pada aturan di rumah adalah ...", "Tidur siang sesuai waktu yang disepakati", ["Bermain gawai terus-menerus", "Pergi tanpa pamit", "Membantah nasihat ibu"], "Betul! Tidur sesuai waktu yang disepakati adalah sikap patuh aturan."],
  ["Sikap yang TIDAK patuh pada aturan di rumah adalah ...", "Bermain gawai melebihi waktu yang disepakati", ["Membereskan tempat tidur", "Belajar sesuai jadwal", "Pamit sebelum pergi"], "Betul! Bermain gawai melebihi waktu adalah sikap tidak patuh aturan."],
  ["Kakak sedang piket menyapu rumah sesuai jadwal. Kakak menunjukkan sikap ...", "Patuh dan bertanggung jawab", ["Malas", "Egois", "Sesuka hati"], "Betul! Melaksanakan piket sesuai jadwal adalah sikap patuh dan bertanggung jawab."],
  ["Adik lupa merapikan mainannya. Sebagai kakak, sebaiknya kita ...", "Mengingatkan adik dengan lembut", ["Memarahi adik", "Membuang mainannya", "Membiarkan saja"], "Betul! Kita mengingatkan adik dengan lembut agar ia patuh aturan."],
  ["Jika kita tidak setuju dengan aturan di rumah, sebaiknya kita ...", "Membicarakannya baik-baik dengan orang tua", ["Langsung melanggarnya", "Marah dan membanting pintu", "Pura-pura tidak tahu"], "Betul! Kita membicarakannya baik-baik agar disepakati bersama."],
  ["Doni selalu mencuci tangan sebelum makan sesuai aturan di rumah. Manfaatnya adalah ...", "Doni terhindar dari kuman dan tetap sehat", ["Doni menjadi sakit", "Tangan Doni kotor", "Makanan menjadi bau"], "Betul! Patuh aturan kebersihan membuat kita sehat."],
  ["Agar rumah tertib, teratur, dan keluarga rukun, kita harus ...", "Mematuhi aturan di rumah", ["Berbuat sesuka hati", "Melanggar aturan", "Tidak peduli kepada keluarga"], "Betul! Dengan mematuhi aturan, rumah tertib dan keluarga rukun."],
];

const questions: QuizQuestion[] = raw.map(([question, correct, wrong, explanation, image], i) => ({
  id: `psas-pb2-${String(i + 1).padStart(2, "0")}`,
  question,
  ...(image ? { image: image[0], imageAlt: image[1] } : {}),
  options: [correct, ...wrong].map((text, j) => ({ id: LETTERS[j], text })),
  correctOptionId: "a",
  explanation,
}));

const chapter: QuizChapter = {
  id: "psas-bab-2-aturan-di-rumah",
  title: "PSAS: Aturan di Rumah",
  subtitle: "Latihan PSAS Ganjil untuk Bab 2: pembuat aturan, manfaat patuh, akibat tidak patuh, dan rumah tanpa aturan",
  emoji: "📝",
  category: "PSAS",
  gradient: "from-amber-400 via-orange-300 to-rose-300",
  material: {
    summary:
      "Ringkasan Bab 2 untuk persiapan PSAS: siapa yang membuat aturan di rumah, manfaat mematuhi aturan, akibat tidak patuh, dan apa yang terjadi jika rumah tanpa aturan.",
    sections: [
      {
        heading: "Aturan di Rumah",
        emoji: "📋",
        image: IMG.diskusi[0],
        imageAlt: IMG.diskusi[1],
        bullets: [
          "Aturan di rumah dibuat oleh ayah dan ibu.",
          "Aturan disepakati oleh seluruh anggota keluarga.",
          "Aturan dibuat untuk mengatur perilaku seseorang.",
          "Aturan setiap keluarga berbeda-beda. Penerapan aturan dalam keluarga juga berbeda.",
          "Mematuhi aturan membuat suasana tertib dan teratur.",
        ],
      },
      {
        heading: "Manfaat Patuh pada Aturan di Rumah",
        emoji: "🌟",
        images: [
          { src: IMG.bersihRumah[0], alt: IMG.bersihRumah[1], caption: "Rumah bersih dan nyaman" },
          { src: IMG.rukun[0], alt: IMG.rukun[1], caption: "Keluarga menjadi rukun" },
        ],
        bullets: [
          "Rumah menjadi bersih dan nyaman.",
          "Melatih anggota keluarga agar disiplin.",
          "Orang tua merasa tenang.",
          "Keluarga menjadi rukun.",
        ],
      },
      {
        heading: "Tidak Patuh pada Aturan Membuat Kita Rugi",
        emoji: "⚠️",
        images: [
          { src: IMG.tempatTidur[0], alt: IMG.tempatTidur[1], caption: "Aturan kebersihan" },
          { src: IMG.nasihat[0], alt: IMG.nasihat[1], caption: "Aturan terhadap orang tua" },
        ],
        bullets: [
          "Aturan kebersihan: tidak patuh membuat kita tidak nyaman karena kotor.",
          "Aturan makan: sisa makanan menimbulkan kuman dan bau tak sedap sehingga kita bisa sakit.",
          "Aturan sekolah: tidak patuh akan mengganggu aktivitas kita di sekolah.",
          "Aturan terhadap orang tua: tidak patuh membuat orang tua marah dan khawatir.",
        ],
      },
      {
        heading: "Jika Rumah Tanpa Aturan",
        emoji: "🏚️",
        bullets: [
          "Anggota keluarga akan berbuat sesuka hati.",
          "Banyak masalah di rumah.",
          "Rumah menjadi kotor.",
          "Anggota keluarga tidak saling menghormati.",
        ],
      },
    ],
  },
  questions,
};

export default chapter;
