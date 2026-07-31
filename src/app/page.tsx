import Link from "next/link";
import { subjects } from "@/data/subjects";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 px-4 py-10">
      <div className="text-center mb-10">
        <div className="text-6xl mb-3">📚✨🚀</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md mb-2">
          Kuis Belajar Anak
        </h1>
        <p className="text-white/90 font-semibold">
          Pilih mata pelajaran, lalu ayo main kuis!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
        {subjects.map((subject) => {
          const totalQuestions = subject.chapters.reduce(
            (sum, c) => sum + c.questions.length,
            0
          );
          return (
            <Link
              key={subject.id}
              href={`/mapel/${subject.id}`}
              className={`group rounded-3xl border-4 border-white/60 bg-gradient-to-br ${subject.gradient} p-6 shadow-xl transition-transform hover:scale-[1.03] active:scale-95`}
            >
              <div className="text-5xl mb-3">{subject.emoji}</div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-1">
                {subject.title}
              </h2>
              <p className="text-slate-800/80 font-semibold text-sm mb-4">
                {subject.description}
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-bold text-slate-800 text-sm group-hover:bg-white">
                Lihat Bab ▶️
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-900/70">
                {subject.chapters.length} bab · {totalQuestions} soal
              </p>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 text-white/80 text-sm font-semibold text-center">
        Lebih banyak mata pelajaran akan segera hadir! 🚀
      </p>
    </main>
  );
}
