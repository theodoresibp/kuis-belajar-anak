import { notFound } from "next/navigation";
import { getChapterById, getSubjectByChapterId, subjects } from "@/data/subjects";
import MaterialView from "@/components/MaterialView";

export function generateStaticParams() {
  return subjects.flatMap((s) => s.chapters.map((c) => ({ chapterId: c.id })));
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = getChapterById(chapterId);
  const subject = getSubjectByChapterId(chapterId);

  if (!chapter || !subject) {
    notFound();
  }

  return (
    <main
      className={`flex-1 flex flex-col items-center justify-center gap-6 bg-gradient-to-br ${chapter.gradient} px-4 py-10`}
    >
      <MaterialView chapter={chapter} subjectId={subject.id} />
    </main>
  );
}
