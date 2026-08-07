import type { Subject } from "@/types/quiz";
import bab1 from "./bab-1-anggota-keluargaku";

// Tambahkan bab baru di sini, contoh:
// import bab2 from "./bab-2-nama-bab";
const subject: Subject = {
  id: "agama",
  title: "Agama",
  description: "Kasih sayang dalam keluarga dan kisah-kisah Alkitab",
  emoji: "🙏",
  gradient: "from-violet-400 via-purple-300 to-fuchsia-300",
  chapters: [bab1 /*, bab2 */],
};

export default subject;
