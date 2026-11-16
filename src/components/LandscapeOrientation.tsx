"use client";

import { useEffect, useState } from "react";

type ScreenOrientationWithLock = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

export default function LandscapeOrientation({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLandscape, setIsLandscape] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(orientation: landscape)");
    const sync = () => setIsLandscape(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    // Best-effort: most browsers block this without a user gesture, so the
    // visible button below remains the reliable way in for the user.
    void requestFullscreen();
  }, []);

  async function requestFullscreen() {
    try {
      if (
        !document.fullscreenElement &&
        document.documentElement.requestFullscreen
      ) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen may be unavailable in an ordinary browser tab.
    }
  }

  async function requestLandscape() {
    await requestFullscreen();

    try {
      const orientation = window.screen
        .orientation as ScreenOrientationWithLock;
      if (typeof orientation.lock === "function") {
        await orientation.lock("landscape");
      }
    } catch {
      // The user can still rotate manually; the guard remains until landscape.
    }
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await requestFullscreen();
    }
  }

  return (
    <>
      {children}
      {!isFullscreen && (
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          aria-label="Masuk mode layar penuh"
          className="fixed top-4 right-4 z-[220] inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-slate-800 shadow-lg hover:bg-white active:scale-95"
        >
          ⛶
        </button>
      )}
      {!isLandscape && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-slate-950 px-6 text-center text-white">
          <div className="text-7xl" aria-hidden>
            📱↻
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">
            Gunakan Layar Landscape
          </h1>
          <p className="max-w-md text-sm font-semibold leading-relaxed text-white/75 sm:text-base">
            Aplikasi belajar ini dirancang untuk layar mendatar. Putar
            perangkatmu ke posisi landscape agar pilihan kelas, pelajaran,
            materi, dan permainan tampil lebih nyaman.
          </p>
          <button
            type="button"
            onClick={() => void requestLandscape()}
            className="rounded-full border-4 border-amber-200 bg-amber-400 px-7 py-3 font-extrabold text-amber-950 shadow-lg active:scale-95"
          >
            Coba Aktifkan Landscape
          </button>
        </div>
      )}
    </>
  );
}
