import type { Subject } from "@/types/quiz";
import bab1 from "./bab-1-perasaan-yang-kualami";
import bab2 from "./bab-2-kata-benda-dan-kalimatku";

const subject: Subject = {
  id: "bahasa-indonesia",
  title: "Bahasa Indonesia",
  description: "Ungkapan perasaan, tata bahasa, dan cerita",
  emoji: "📖",
  gradient: "from-sky-400 via-blue-300 to-indigo-300",
  chapters: [bab1, bab2],
};

export default subject;
