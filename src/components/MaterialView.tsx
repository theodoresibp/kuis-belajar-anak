import Image from "next/image";
import Link from "next/link";
import type { ChapterMaterial, QuizChapter } from "@/types/quiz";

/** The violet summary box — the material's intro, verbatim. Shared by
 *  the material page and the Adventure owl panel (Sprint 1), so the
 *  material is presented identically (and in full) in both places. */
export function MaterialSummary({ material }: { material: ChapterMaterial }) {
  return (
    <p className="rounded-2xl bg-violet-50 border-2 h-full w-full border-violet-100 px-4 py-3 text-slate-700 font-semibold text-sm sm:text-base">
      📖 {material.summary}
    </p>
  );
}

/** Every material section, rendered in full: heading, image,
 *  paragraphs, gallery and bullets — nothing is trimmed. */
export function MaterialSections({ material }: { material: ChapterMaterial }) {
  return (
    <div className="material-slide-track flex flex-col gap-6 h-full w-full">
      {material.sections.map((section, idx) => (
        <section
          key={idx}
          className="material-slide border-t-2 border-slate-100 pt-4"
        >
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

          {section.images && section.images.length > 0 && (
            <div className="mt-2 mb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {section.images.map((img, imgIdx) => (
                <div
                  key={imgIdx}
                  className="overflow-hidden rounded-2xl border-4 border-violet-100 bg-slate-50 flex flex-col"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={320}
                    height={240}
                    unoptimized
                    className="w-full h-24 sm:h-28 object-contain bg-white"
                  />
                  {img.caption && (
                    <p className="text-center text-xs font-semibold text-slate-600 px-1 py-1.5 bg-violet-50">
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

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
  );
}

export default function MaterialView({
  chapter,
  subjectId,
}: {
  chapter: QuizChapter;
  subjectId: string;
}) {
  const material = chapter.material;

  return (
    <div className="material-view w-full max-w-none flex-1 flex flex-col items-center gap-2">
      <div className="w-full flex items-center justify-between">
        <Link
          href={`/mapel/${subjectId}`}
          className="inline-flex rounded-full max-w-30 bg-white/90 px-4 py-2 text-sm font-bold text-slate-800 shadow hover:bg-white"
        >
          ◀️ Kembali
        </Link>

        <Link
          href={`/quiz/${chapter.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 font-bold text-white text-sm hover:bg-slate-800"
        >
          ▶️ Sudah paham? Mulai Kuis!
        </Link>
      </div>

      <div className="material-shell w-full min-h-full rounded-3xl bg-white/95 shadow-xl p-2 sm:p-2">
        <div className="text-center mb-2">
          <h1 className="text-2xl sm:text-2xl font-extrabold text-slate-900 mb-1">
            {chapter.title}
          </h1>
          {chapter.subtitle && (
            <p className="text-slate-500 font-semibold">{chapter.subtitle}</p>
          )}
        </div>

        {material ? (
          <>
            <div
              className="material-carousel w-full h-full"
              aria-label="Slide materi"
            >
              <div className="material-slide h-full w-full">
                <MaterialSummary material={material} />
              </div>

              <MaterialSections material={material} />
            </div>
          </>
        ) : (
          <p className="text-center text-slate-500 font-semibold">
            Materi untuk bab ini belum tersedia. Yuk langsung coba kuisnya!
          </p>
        )}
      </div>
    </div>
  );
}
