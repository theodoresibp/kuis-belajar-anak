import { notFound } from "next/navigation";
import { getChapterById, chapters } from "@/data/chapters";
import QuizGame from "@/components/QuizGame";

export function generateStaticParams() {
  return chapters.map((c) => ({ chapterId: c.id }));
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
    <main
      className={`flex-1 flex flex-col items-center justify-center gap-6 bg-gradient-to-br ${chapter.gradient} px-4 py-10`}
    >
      <QuizGame chapter={chapter} />
    </main>
  );
}
