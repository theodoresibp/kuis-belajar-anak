import { notFound } from "next/navigation";
import AdventureMode from "@/components/adventure/AdventureMode";
import { getChapterById, subjects } from "@/data/subjects";
import { DIFFICULTIES, DEFAULT_DIFFICULTY, type Difficulty } from "@/features/adventure/difficulty";

export function generateStaticParams() {
  return subjects.flatMap((subject) =>
    subject.chapters.map((chapter) => ({ chapterId: chapter.id })),
  );
}

export default async function AdventurePage({
  params,
  searchParams,
}: {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ count?: string; hero?: string; difficulty?: string }>;
}) {
  const [{ chapterId }, query] = await Promise.all([params, searchParams]);
  const chapter = getChapterById(chapterId);

  if (!chapter || chapter.questions.length === 0) {
    notFound();
  }

  const requestedCount = Number.parseInt(query.count ?? "", 10);
  const questionCount = Number.isFinite(requestedCount) && requestedCount > 0
    ? Math.min(requestedCount, chapter.questions.length)
    : chapter.questions.length;

  const allowedHeroIds = new Set(["rara", "bimo", "tari"]);
  const heroId = allowedHeroIds.has(query.hero ?? "") ? query.hero! : "bimo";

  const allowedDifficulties = new Set(DIFFICULTIES.map((d) => d.id));
  const difficulty: Difficulty = allowedDifficulties.has(query.difficulty as Difficulty)
    ? (query.difficulty as Difficulty)
    : DEFAULT_DIFFICULTY;

  return (
    <AdventureMode
      chapter={chapter}
      questionCount={questionCount}
      heroId={heroId}
      difficulty={difficulty}
    />
  );
}
