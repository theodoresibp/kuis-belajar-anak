"use client";

interface Props {
  score: number;
  total: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

function getRating(pct: number) {
  if (pct === 100) return { emoji: "🏆", text: "Sempurna! Kamu Juara!" };
  if (pct >= 80) return { emoji: "🌟", text: "Keren banget! Hampir sempurna!" };
  if (pct >= 60) return { emoji: "😄", text: "Bagus! Terus berlatih ya!" };
  if (pct >= 40) return { emoji: "🙂", text: "Lumayan! Ayo coba lagi!" };
  return { emoji: "💪", text: "Jangan menyerah, coba lagi yuk!" };
}

export default function ResultScreen({ score, total, onPlayAgain, onBackToMenu }: Props) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const rating = getRating(pct);

  return (
    <div className="w-full max-w-xl rounded-3xl bg-white/95 shadow-xl p-8 border-4 border-white text-center">
      <div className="text-6xl mb-3">{rating.emoji}</div>
      <h2 className="text-2xl font-extrabold text-slate-800 mb-1">{rating.text}</h2>
      <p className="text-slate-500 mb-6">Kamu menjawab dengan benar:</p>

      <div className="text-5xl font-black text-violet-600 mb-1">
        {score} <span className="text-2xl text-slate-400 font-bold">/ {total}</span>
      </div>
      <div className="text-lg font-bold text-slate-500 mb-8">{pct}%</div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onPlayAgain}
          className="rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 shadow-md transition-colors"
        >
          🔁 Main Lagi
        </button>
        <button
          onClick={onBackToMenu}
          className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 shadow-sm transition-colors"
        >
          🏠 Pilih Bab Lain
        </button>
      </div>
    </div>
  );
}
