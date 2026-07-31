import type { QuizChapter, Subject } from "@/types/quiz";
import seniBudaya from "./seni-budaya";
import bahasaIndonesia from "./bahasa-indonesia";

// Tambahkan mata pelajaran baru di sini, contoh:
// import matematika from "./matematika";
export const subjects: Subject[] = [seniBudaya, bahasaIndonesia /*, matematika */];

export function getSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export function getChapterById(chapterId: string): QuizChapter | undefined {
  for (const subject of subjects) {
    const chapter = subject.chapters.find((c) => c.id === chapterId);
    if (chapter) return chapter;
  }
  return undefined;
}
