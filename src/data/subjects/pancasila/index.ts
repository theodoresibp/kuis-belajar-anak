import type { Subject } from "@/types/quiz";
import bab1 from "./bab-1-garuda-pancasila-lambang-negaraku";
import bab2 from "./bab-2-aturan-di-rumah";
import pstsBab1 from "./psts-bab-1-garuda-pancasila-lambang-negaraku";

const subject: Subject = {
  id: "pancasila",
  title: "Pendidikan Pancasila",
  description: "Lambang negara, sila-sila Pancasila, dan aturan di rumah",
  emoji: "🦅",
  gradient: "from-red-500 via-rose-400 to-amber-300",
  chapters: [bab1, bab2, pstsBab1],
};

export default subject;
