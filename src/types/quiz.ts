export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  /** Optional external image URL to illustrate the question */
  image?: string;
  imageAlt?: string;
  options: QuizOption[];
  correctOptionId: string;
  /** Short kid-friendly explanation shown after answering */
  explanation?: string;
}

export interface QuizChapter {
  id: string;
  title: string;
  subtitle?: string;
  emoji: string;
  /** Tailwind gradient classes for the chapter card */
  gradient: string;
  questions: QuizQuestion[];
}
