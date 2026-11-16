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
      className={`h-full min-h-0 w-full flex-1 overflow-hidden flex flex-col items-stretch justify-start bg-gradient-to-br ${subject.gradient} px-3 py-2`}
    >
      <div className="shrink-0 flex items-center gap-3 mb-4">
        <Link
          href={`/kelas/${subject.grade ?? 2}`}
          className="shrink-0 inline-flex rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-800 shadow hover:bg-white"
        >
          ◀️ Kembali
        </Link>

        <div className="flex-1 text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 drop-shadow-sm leading-tight">
            {subject.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-900/80 font-semibold leading-tight">
            {subject.description}
          </p>
        </div>

        <div className="w-24 shrink-0" aria-hidden />
      </div>

      <section className="flex min-h-0 flex-1 flex-col w-full max-w-none items-center">
        <div
          className="landscape-carousel landscape-carousel--chapters min-h-0 flex-1 items-stretch"
          aria-label="Daftar bab"
        >
          {subject.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={`min-h-60 max-h-60 min-w-[400px] max-w-[400px] flex flex-col rounded-3xl border-2 p-4 pb-2 shadow-xl transition-transform hover:scale-[1.02] ${
                chapter.category
                  ? "border-amber-400 bg-amber-100/95"
                  : "border-white/60 bg-white/90"
              }`}
            >
              <div className="min-h-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  {chapter.category && (
                    <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-amber-950">
                      📝 {chapter.category}
                    </span>
                  )}
                  <div className="text-3xl">{chapter.emoji}</div>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-1">
                  {chapter.title}
                </h2>
                <p className="text-slate-800/80 font-semibold text-sm mb-3">
                  {chapter.subtitle}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-center">
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                <p className="mt-2 text-xs font-semibold text-slate-900/70">
                  {chapter.questions.length} soal tersedia
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
