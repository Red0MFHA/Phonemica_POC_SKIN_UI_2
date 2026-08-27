"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { theme } from "@/config/game";
import { engineClient } from "@/services";
import { getGameState } from "@/lib/state";
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
        rewardLabel: lv ? "A rescue beacon lights up!" : "Cosmos conquered!",
        mastered: true,
      });
    });
  }, [router]);

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-gradient-to-b ${theme.background} p-6 text-center`}>
      <Trophy size={64} className="text-cyan-400" />
      <h1 className="mt-4 text-3xl font-black text-white">Mission Complete!</h1>
      <p className="mt-2 text-lg text-cyan-200">{result?.rewardLabel ?? "Great piloting!"}</p>

      <div className="mt-4 flex gap-1 text-4xl">
        {Array.from({ length: result?.stars ?? 0 }).map((_, i) => <span key={i}>⭐</span>)}
      </div>

      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push("/map")}
          className="w-full rounded-2xl bg-cyan-400 px-6 py-3 text-lg font-bold text-indigo-950 shadow-lg transition-transform hover:scale-105"
        >
          Star Map
        </button>
        <button
          onClick={async () => {
            router.push("/progress");
          }}
          className="w-full rounded-2xl border border-cyan-400 px-6 py-3 text-lg font-bold text-cyan-100 transition-transform hover:scale-105"
        >
          See progress
        </button>
      </div>
    </div>
  );
}
