import type { QuizChapter } from "@/types/quiz";
import bab1 from "./bab-1-karya-seni-rupa";

// Tambahkan bab baru di sini, contoh:
// import bab2 from "./bab-2-nama-file";
export const chapters: QuizChapter[] = [bab1 /*, bab2 */];

export function getChapterById(id: string): QuizChapter | undefined {
  return chapters.find((c) => c.id === id);
}
