import Image from "next/image";
import Link from "next/link";
import type { QuizChapter } from "@/types/quiz";

export default function MaterialView({
  chapter,
  subjectId,
}: {
  chapter: QuizChapter;
  subjectId: string;
}) {
  const material = chapter.material;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-4">
      <div className="w-full flex items-center justify-between">
        <Link
          href={`/mapel/${subjectId}`}
          className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-bold text-slate-800 text-sm hover:bg-white"
        >
          ◀️ Kembali
        </Link>
        <Link
          href={`/quiz/${chapter.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 font-bold text-white text-sm hover:bg-slate-800"
        >
          Mulai Kuis ▶️
        </Link>
      </div>

      <div className="w-full rounded-3xl bg-white/95 shadow-xl p-6 sm:p-8 border-4 border-white">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{chapter.emoji}</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            {chapter.title}
          </h1>
          {chapter.subtitle && (
            <p className="text-slate-500 font-semibold">{chapter.subtitle}</p>
          )}
        </div>

        {material ? (
          <>
            <p className="rounded-2xl bg-violet-50 border-2 border-violet-100 px-4 py-3 text-slate-700 font-semibold text-sm sm:text-base mb-6">
              📖 {material.summary}
            </p>

            <div className="flex flex-col gap-6">
              {material.sections.map((section, idx) => (
                <section key={idx} className="border-t-2 border-slate-100 pt-5 first:border-t-0 first:pt-0">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                    {section.emoji && <span>{section.emoji}</span>}
                    {section.heading}
                  </h2>

                  {section.image && (
                    <div className="mb-4 overflow-hidden rounded-2xl border-4 border-violet-100 bg-slate-50">
                      <Image
                        src={section.image}
                        alt={section.imageAlt ?? ""}
                        width={640}
                        height={360}
                        unoptimized
                        className="w-full h-48 sm:h-56 object-contain bg-white"
                      />
                    </div>
                  )}

                  {section.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx} className="text-slate-700 leading-relaxed mb-3 last:mb-0">
                      {p}
                    </p>
                  ))}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-2">
                      {section.bullets.map((b, bIdx) => (
                        <li
                          key={bIdx}
                          className="flex items-start gap-2 text-slate-700 leading-relaxed"
                        >
                          <span className="mt-1 text-violet-500">●</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-slate-500 font-semibold">
            Materi untuk bab ini belum tersedia. Yuk langsung coba kuisnya!
          </p>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href={`/quiz/${chapter.id}`}
            className="rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 shadow-md transition-colors"
          >
            ▶️ Sudah paham? Mulai Kuis!
          </Link>
        </div>
      </div>
    </div>
  );
}
