import Link from "next/link";
import { getAvailableGrades, getSubjectsByGrade } from "@/data/subjects";

export default function HomePage() {
  const grades = getAvailableGrades();

  return (
    <main className="h-full min-h-0 flex-1 overflow-hidden bg-[url('/assets/gamification/backgrounds/bg_game.jpg')] bg-cover bg-center bg-fixed flex items-center px-3 py-3 sm:px-6">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-col justify-center">
        <header className="mb-2 shrink-0 text-center">
          {/* <div className="mb-2 text-6xl" aria-hidden>📚✨🚀</div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg sm:text-4xl">
            Petualangan Belajar
          </h1>
          <p className="mt-2 text-base font-semibold text-white/90">
            Pilih kelasmu untuk mulai belajar dan bermain!
          </p> */}
        </header>

        <section className="landscape-carousel landscape-carousel--choices" aria-label="Daftar kelas">
          {grades.map((grade) => {
            const subjectCount = getSubjectsByGrade(grade).length;
            return (
              <Link
                key={grade}
                href={`/kelas/${grade}`}
                className="group rounded-3xl border-4 border-white/70 bg-gradient-to-br from-amber-300 via-yellow-200 to-orange-200 p-7 text-center shadow-2xl transition-transform hover:scale-[1.03] active:scale-95"
              >
                <div className="mb-3 text-6xl" aria-hidden>🎒</div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Kelas {grade} SD
                </h2>
                <p className="mt-2 font-semibold text-slate-700">
                  {subjectCount} mata pelajaran tersedia
                </p>
                <span className="mt-5 inline-flex rounded-full bg-slate-900 px-6 py-3 font-bold text-white group-hover:bg-slate-700">
                  Pilih Kelas ▶️
                </span>
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
