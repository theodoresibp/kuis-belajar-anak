import { notFound } from "next/navigation";
import AdventureMode from "@/components/adventure/AdventureMode";
import { getChapterById, subjects } from "@/data/subjects";

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
  searchParams: Promise<{ count?: string }>;
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

  return <AdventureMode chapter={chapter} questionCount={questionCount} />;
}
