import Link from "next/link";
import { chapters } from "@/data/chapters";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 px-4 py-10">
      <div className="text-center mb-10">
        <div className="text-6xl mb-3">🎨🖍️✨</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md mb-2">
          Kuis Seni Budaya
        </h1>
        <p className="text-white/90 font-semibold">
          Ayo main kuis dan uji pemahamanmu, Kelas 2!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`/quiz/${chapter.id}`}
            className={`group rounded-3xl border-4 border-white/60 bg-gradient-to-br ${chapter.gradient} p-6 shadow-xl transition-transform hover:scale-[1.03] active:scale-95`}
          >
            <div className="text-5xl mb-3">{chapter.emoji}</div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              {chapter.title}
            </h2>
            <p className="text-slate-800/80 font-semibold text-sm mb-4">
              {chapter.subtitle}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-bold text-slate-800 text-sm group-hover:bg-white">
              Main Sekarang ▶️
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-900/70">
              {chapter.questions.length} soal tersedia
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-white/80 text-sm font-semibold text-center">
        Lebih banyak bab akan segera hadir! 🚀
      </p>
    </main>
  );
}
