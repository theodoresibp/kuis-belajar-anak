import type { Subject } from "@/types/quiz";
import unit1 from "./unit-1-in-my-classroom";

// Tambahkan unit baru di sini, contoh:
// import unit2 from "./unit-2-nama-unit";
const subject: Subject = {
  id: "english",
  title: "English",
  description: "Classroom activities, grammar, and numbers",
  emoji: "🇬🇧",
  gradient: "from-emerald-400 via-teal-300 to-cyan-300",
  chapters: [unit1 /*, unit2 */],
};

export default subject;
