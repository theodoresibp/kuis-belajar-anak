import type { Subject } from "@/types/quiz";
import bab1 from "./bab-1-benda-di-sekitarku";

// Tambahkan bab baru di sini, contoh:
// import bab2 from "./bab-2-nama-bab";
const subject: Subject = {
  id: "ipas",
  title: "IPAS",
  description: "Ciri-ciri, wujud, dan perubahan benda di sekitar kita",
  emoji: "🔬",
  gradient: "from-lime-400 via-green-300 to-teal-300",
  chapters: [bab1 /*, bab2 */],
};

export default subject;
