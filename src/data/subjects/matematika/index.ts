import type { Subject } from "@/types/quiz";
import bab1 from "./bab-1-bilangan-sampai-100";

// Tambahkan bab baru di sini, contoh:
// import bab2 from "./bab-2-nama-bab";
const subject: Subject = {
  id: "matematika",
  title: "Matematika",
  description: "Bilangan, nilai tempat, dan pola bilangan sampai 100",
  emoji: "🔢",
  gradient: "from-blue-400 via-cyan-300 to-sky-300",
  chapters: [bab1 /*, bab2 */],
};

export default subject;
