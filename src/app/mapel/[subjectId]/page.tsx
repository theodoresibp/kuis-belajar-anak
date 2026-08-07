import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectById, subjects } from "@/data/subjects";

export function generateStaticParams() {
  return subjects.map((s) => ({ subjectId: s.id }));
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subject = getSubjectById(subjectId);

  if (!subject) {
    notFound();
  }

  return (
    <main
      className={`flex-1 flex flex-col items-center justify-center bg-gradient-to-br ${subject.gradient} px-4 py-10`}
    >
      <Link
        href="/"
        className="mb-6 self-start sm:self-auto sm:mb-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-bold text-slate-800 text-sm hover:bg-white"
      >
        ◀️ Mata Pelajaran
      </Link>

      <div className="text-center mb-10">
        <div className="text-6xl mb-3">{subject.emoji}</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 drop-shadow-sm mb-2">
          {subject.title}
        </h1>
        <p className="text-slate-900/80 font-semibold">{subject.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
        {subject.chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="rounded-3xl border-4 border-white/60 bg-white/90 p-6 shadow-xl transition-transform hover:scale-[1.02]"
          >
            <div className="text-5xl mb-3">{chapter.emoji}</div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              {chapter.title}
            </h2>
            <p className="text-slate-800/80 font-semibold text-sm mb-4">
              {chapter.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/materi/${chapter.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-white border-2 border-slate-900 px-4 py-2 font-bold text-slate-900 text-sm hover:bg-slate-100 active:scale-95 transition-transform"
              >
                📖 Baca Materi
              </Link>
              <Link
                href={`/quiz/${chapter.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 font-bold text-white text-sm hover:bg-slate-800 active:scale-95 transition-transform"
              >
                Main Sekarang ▶️
              </Link>
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-900/70">
              {chapter.questions.length} soal tersedia
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
