import AdventureMode from "@/components/adventure/AdventureMode";
import { subjects } from "@/data/subjects";

export default function AdventurePreviewPage() {
  const chapter = subjects.flatMap((subject) => subject.chapters)[0];

  if (!chapter || chapter.questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-center">
        Belum ada bab dengan soal untuk dimainkan.
      </main>
    );
  }

  return <AdventureMode chapter={chapter} />;
}
