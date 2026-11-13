
"use client";

import Link from "next/link";
import AdventureGameCanvas from "./AdventureGameCanvas";

export default function AdventureMode() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-b from-emerald-100 via-lime-50 to-amber-100 px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                Adventure Mode
              </span>

              <span className="rounded-full border border-emerald-300 bg-white/70 px-3 py-1 text-xs font-bold text-emerald-800">
                Prototype • Sprint 1
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
              Enchanted Forest
            </h1>

            <p className="mt-1 max-w-xl text-sm font-medium text-emerald-800 sm:text-base">
              Mulai petualanganmu! Jelajahi hutan ajaib,
              lewati platform, dan bersiaplah menghadapi
              berbagai tantangan.
            </p>
          </div>

          <Link
            href="/"
            className="shrink-0 rounded-full border-2 border-emerald-700 bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            ← Kembali
          </Link>
        </header>

        <section className="overflow-hidden rounded-3xl border-4 border-white bg-emerald-900/10 p-2 shadow-xl sm:p-3">
          <div className="overflow-hidden rounded-2xl">
            <AdventureGameCanvas />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                🌳
              </span>
              <strong className="text-sm font-extrabold text-emerald-950">
                Dunia Pertama
              </strong>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              Enchanted Forest adalah awal perjalanan
              menjelajahi dunia petualangan.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                🏃
              </span>
              <strong className="text-sm font-extrabold text-emerald-950">
                Kontrol Karakter
              </strong>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              Bergerak ke kiri dan kanan, lalu lompat
              melewati platform.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                ⚔️
              </span>
              <strong className="text-sm font-extrabold text-emerald-950">
                Tantangan Berikutnya
              </strong>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              Monster, encounter, sistem HP, dan arena
              pertarungan akan ditambahkan pada sprint berikutnya.
            </p>
          </div>
        </section>

        <footer className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-emerald-800">
            Prototype Sprint 1 — karakter dan lingkungan
            masih menggunakan aset sementara.
          </p>
        </footer>
      </div>
    </main>
  );
}
