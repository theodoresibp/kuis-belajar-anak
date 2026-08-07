import type { QuizChapter, Subject } from "@/types/quiz";
import seniBudaya from "./seni-budaya";
import bahasaIndonesia from "./bahasa-indonesia";
import english from "./english";
import agama from "./agama";
import matematika from "./matematika";
import ipas from "./ipas";

// Tambahkan mata pelajaran baru di sini, contoh:
export const subjects: Subject[] = [seniBudaya, bahasaIndonesia, english, agama, matematika, ipas];

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

export function getSubjectByChapterId(chapterId: string): Subject | undefined {
  return subjects.find((s) => s.chapters.some((c) => c.id === chapterId));
}
