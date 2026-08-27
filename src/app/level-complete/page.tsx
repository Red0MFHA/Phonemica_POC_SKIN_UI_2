"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/config/game";
import { engineClient } from "@/services";
import { getGameState } from "@/lib/state";
import BgZone from "@/components/BgZone";
import Confetti from "@/components/Confetti";
import type { LevelCompleteResult } from "@/types/engine";

export default function LevelCompletePage() {
  const router = useRouter();
  const [result, setResult] = useState<LevelCompleteResult | null>(null);

  useEffect(() => {
    const sessionId = getGameState().sessionId;
    if (!sessionId) { router.replace("/home"); return; }
    // Derive current completion from a fresh level fetch (the mock returns the next level after completion).
    engineClient.getCurrentLevel(sessionId).then((lv) => {
      setResult({
        stars: 3,
        nextLevelId: lv?.id,
        rewardLabel: lv ? "Next hostile wave incoming!" : "Sector defended — ship secured!",
        mastered: true,
      });
    });
  }, [router]);

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b ${theme.background} p-6 text-center`}>
      <BgZone />
      <Confetti />

      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-floaty text-8xl drop-shadow-2xl">🛸</div>
        <h1 className="mt-4 animate-pop-in text-4xl font-black text-white drop-shadow-lg">Wave Cleared!</h1>
        <p className="mt-3 text-xl font-semibold text-cyan-200">{result?.rewardLabel ?? "Ship secured!"}</p>

        <div className="mt-5 flex gap-1 text-5xl">
          {Array.from({ length: result?.stars ?? 0 }).map((_, i) => <span key={i} className="animate-pop-in" style={{ animationDelay: `${0.25 * i}s` }}>⭐</span>)}
        </div>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => router.push("/map")}
            className="w-full rounded-2xl bg-cyan-400 px-6 py-4 text-2xl font-bold text-indigo-950 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Space Map
          </button>
          <button
            onClick={() => router.push("/progress")}
            className="w-full rounded-2xl border-2 border-cyan-400 px-6 py-4 text-2xl font-bold text-cyan-100 transition-transform hover:scale-105 active:scale-95"
          >
            See progress
          </button>        </div>
      </div>
    </div>
  );
}
