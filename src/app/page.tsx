import Link from "next/link";
import { getAvailableGrades, getSubjectsByGrade } from "@/data/subjects";

export default function HomePage() {
  const grades = getAvailableGrades();

  return (
    <main className="h-full min-h-0 flex-1 overflow-hidden bg-[url('/assets/gamification/backgrounds/bg_game.jpg')] bg-cover bg-center bg-fixed flex items-center px-3 py-3 sm:px-6">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-col justify-center">
        <header className="mb-24 shrink-0 text-center"></header>

        <section
          className="landscape-carousel landscape-carousel--choices"
          aria-label="Daftar kelas"
        >
          {grades.map((grade) => {
            const subjectCount = getSubjectsByGrade(grade).length;
            return (
              <Link
                key={grade}
                href={`/kelas/${grade}`}
                className="group rounded-3xl border-4 min-w-50 max-w-50 border-white/70 bg-gradient-to-br from-amber-300 via-yellow-200 to-orange-200 p-4 text-center shadow-2xl transition-transform hover:scale-[1.03] active:scale-95"
              >
                <div className="m-2 text-6xl" aria-hidden>
                  🎒
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Kelas {grade} SD
                </h2>
                <p className="mt-2 font-semibold text-slate-700">
                  {subjectCount} mata pelajaran
                </p>
              </Link>
            );
          })}
        </section>

        <p className="mt-2 shrink-0 text-center text-xs font-semibold text-white drop-shadow">
          Kelas lainnya akan segera hadir! 🌟
        </p>
      </div>
    </main>
  );
}
