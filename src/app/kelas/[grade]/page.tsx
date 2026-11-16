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
  if (!Number.isInteger(grade) || !getAvailableGrades().includes(grade)) notFound();

  const gradeSubjects = getSubjectsByGrade(grade);

  return (
    <main className="min-h-full flex-1 overflow-y-auto bg-gradient-to-br from-sky-300 via-indigo-200 to-violet-300 px-5 py-7 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/" className="inline-flex rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-800 shadow hover:bg-white">
          ◀️ Pilih Kelas
        </Link>

        <header className="my-7 text-center">
          <div className="text-5xl" aria-hidden>🎒📚</div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Mata Pelajaran Kelas {grade} SD
          </h1>
          <p className="mt-2 font-semibold text-slate-700">
            Pilih pelajaran yang ingin kamu pelajari.
          </p>
        </header>

        <section className="landscape-carousel landscape-carousel--choices" aria-label="Daftar mata pelajaran">
          {gradeSubjects.map((subject) => {
            const totalQuestions = subject.chapters.reduce((sum, chapter) => sum + chapter.questions.length, 0);
            const chapterCount = subject.chapters.filter((chapter) => !chapter.category).length;
            return (
              <Link
                key={subject.id}
                href={`/mapel/${subject.id}`}
                className={`group rounded-3xl border-4 border-white/70 bg-gradient-to-br ${subject.gradient} p-6 shadow-xl transition-transform hover:scale-[1.02] active:scale-95`}
              >
                <div className="mb-3 text-5xl" aria-hidden>{subject.emoji}</div>
                <h2 className="text-xl font-extrabold text-slate-900">{subject.title}</h2>
                <p className="mt-1 min-h-10 text-sm font-semibold text-slate-800/80">{subject.description}</p>
                <div className="mt-4 inline-flex rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-800 group-hover:bg-white">
                  Lihat Materi ▶️
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-900/70">
                  {chapterCount} bab · {totalQuestions} soal
                </p>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
