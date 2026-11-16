import { notFound } from "next/navigation";
import { getChapterById, subjects } from "@/data/subjects";
import QuizGame from "@/components/QuizGame";

export function generateStaticParams() {
  return subjects.flatMap((s) => s.chapters.map((c) => ({ chapterId: c.id })));
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = getChapterById(chapterId);

  if (!chapter) {
    notFound();
  }

  return (
    <div
      className={`h-full min-h-0 w-full flex-1 overflow-hidden flex flex-col items-center justify-center gap-3 bg-gradient-to-br ${chapter.gradient} px-3 py-2`}
    >
      <QuizGame chapter={chapter} />
    </div>
  );
}
