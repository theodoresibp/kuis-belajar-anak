import Link from "next/link";
import { notFound } from "next/navigation";
import { getAvailableGrades, getSubjectsByGrade } from "@/data/subjects";

export function generateStaticParams() {
  return getAvailableGrades().map((grade) => ({ grade: String(grade) }));
}

export default async function GradePage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const { grade: gradeParam } = await params;
  const grade = Number(gradeParam);
  if (!Number.isInteger(grade) || !getAvailableGrades().includes(grade))
    notFound();

  const gradeSubjects = getSubjectsByGrade(grade);

  return (
    <main className="h-full min-h-0 w-full flex-1 overflow-hidden flex flex-col items-stretch justify-start bg-gradient-to-br from-sky-300 via-indigo-200 to-violet-300 px-3 py-2">
      <div className="shrink-0 flex items-center gap-3 mt-1.5">
        <Link
          href="/"
          className="shrink-0 inline-flex rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-800 shadow hover:bg-white"
        >
          ◀️ Pilih Kelas
        </Link>

        <p className="flex-1 text-center text-sm font-semibold text-slate-700">
          Pilih pelajaran yang ingin kamu pelajari.
        </p>

        <div className="w-24 shrink-0" aria-hidden />
      </div>

      <section
        className="landscape-carousel landscape-carousel--choices"
        aria-label="Daftar mata pelajaran"
      >
        {gradeSubjects.map((subject) => {
          const totalQuestions = subject.chapters.reduce(
            (sum, chapter) => sum + chapter.questions.length,
            0,
          );
          const chapterCount = subject.chapters.filter(
            (chapter) => !chapter.category,
          ).length;
          return (
            <Link
              key={subject.id}
              href={`/mapel/${subject.id}`}
              className={`min-h-60 max-h-60 min-w-80 max-w-80 group rounded-3xl border-4 scroll-hidden border-white/70 bg-gradient-to-br ${subject.gradient} p-4 shadow-xl transition-transform hover:scale-[1.02] active:scale-95`}
            >
              <div className="mb-2 text-3xl" aria-hidden>
                {subject.emoji}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {subject.title}
              </h2>
              <p className="mt-1 min-h-10 text-sm font-semibold text-slate-800/80">
                {subject.description}
              </p>

              <p className="mt-3 text-xs font-semibold text-slate-900/70">
                {chapterCount} bab · {totalQuestions} soal
              </p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
