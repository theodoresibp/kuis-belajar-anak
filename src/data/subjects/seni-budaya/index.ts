import type { Subject } from "@/types/quiz";
import bab1 from "./bab-1-karya-seni-rupa";
import psasTariTeater from "./psas-tari-dan-teater";

// Tambahkan bab baru di sini, contoh:
// import bab2 from "./bab-2-nama-file";
const subject: Subject = {
  id: "seni-budaya",
  grade: 2,
  title: "Seni Budaya",
  description: "Karya seni rupa, musik, dan budaya Indonesia",
  emoji: "🎨",
  gradient: "from-pink-400 via-orange-300 to-yellow-300",
  chapters: [bab1 /*, bab2 */, psasTariTeater],
};

export default subject;
