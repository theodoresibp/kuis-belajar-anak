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

export interface MaterialSection {
  heading: string;
  emoji?: string;
  /** Paragraphs of body text, rendered in order */
  paragraphs?: string[];
  /** Short bullet points, rendered as a list */
  bullets?: string[];
  image?: string;
  imageAlt?: string;
}

export interface ChapterMaterial {
  /** Short intro shown at the top of the material page */
  summary: string;
  sections: MaterialSection[];
}

export interface QuizChapter {
  id: string;
  title: string;
  subtitle?: string;
  emoji: string;
  /** Tailwind gradient classes for the chapter card */
  gradient: string;
  /** Readable study material shown before the quiz */
  material?: ChapterMaterial;
  questions: QuizQuestion[];
}

export interface Subject {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  /** Tailwind gradient classes for the subject card */
  gradient: string;
  chapters: QuizChapter[];
}
