import type { Subject } from "@/types/quiz";
import bab1 from "./bab-1-garuda-pancasila-lambang-negaraku";
import pstsBab1 from "./psts-bab-1-garuda-pancasila-lambang-negaraku";

// Tambahkan bab baru di sini, contoh:
// import bab2 from "./bab-2-nama-bab";
const subject: Subject = {
  id: "pancasila",
  title: "Pendidikan Pancasila",
  description: "Lambang negara, sila-sila Pancasila, dan penerapannya dalam kehidupan sehari-hari",
  emoji: "🦅",
  gradient: "from-red-500 via-rose-400 to-amber-300",
  chapters: [bab1, /* bab2, */ pstsBab1],
};

export default subject;
