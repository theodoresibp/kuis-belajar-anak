import type { Subject } from "@/types/quiz";
import bab1 from "./bab-1-bilangan-sampai-100";
import bab3 from "./bab-3-bangun-datar-dan-bangun-ruang";
import pstsBab3 from "./psts-bab-3-bangun-datar-dan-bangun-ruang";

const subject: Subject = {
  id: "matematika",
  title: "Matematika",
  description: "Bilangan, nilai tempat, bangun datar, dan bangun ruang",
  emoji: "🔢",
  gradient: "from-blue-400 via-cyan-300 to-sky-300",
  chapters: [bab1, bab3, pstsBab3],
};

export default subject;
