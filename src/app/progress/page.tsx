"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme, alienForPhoneme } from "@/config/game";
import { engineClient } from "@/services";
import { clearGameState, getGameState } from "@/lib/state";
import type { SessionProgress } from "@/types/engine";

const MASTERY_BADGE: Record<string, { label: string; color: string }> = {
  mastered: { label: "Mastered", color: "bg-emerald-500" },
  developing: { label: "Developing", color: "bg-cyan-400" },
  needs_practice: { label: "Practice", color: "bg-red-500" },
};

export default function ProgressPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<SessionProgress | null>(null);

  useEffect(() => {
    const sessionId = getGameState().sessionId;
    if (!sessionId) { router.replace("/home"); return; }
    (async () => {
      const pg = await engineClient.getProgress(sessionId);
      // Session over — clear so the next run starts fresh.
      await engineClient.completeSession(sessionId);
      clearGameState();
      setProgress(pg);
    })();
  }, [router]);

  return (
    <div className={`flex min-h-screen flex-col items-center bg-gradient-to-b ${theme.background} p-6`}>
      <h1 className="mt-2 text-2xl font-black text-white">Your Rescue Progress</h1>
      <p className="text-sm text-cyan-200">Master sounds to unlock new sectors</p>

      {progress && (
        <>
          <div className="mt-6 flex items-center gap-2">
            <span className="text-cyan-300">⭐</span>
            <span className="text-xl font-bold text-white">{progress.totalStars} stars</span>
          </div>

          <div className="mt-6 w-full max-w-sm space-y-3">
            {progress.phonemes.map((p) => {
              const badge = MASTERY_BADGE[p.mastery];
              return (
                <div key={p.phoneme} className="flex items-center gap-3 rounded-2xl bg-indigo-950/60 p-4">
                  <div className="text-3xl">{alienForPhoneme[p.phoneme] ?? "👽"}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{p.phoneme}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-indigo-950 ${badge.color}`}>{badge.label}</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
                      <div className={`h-full rounded-full ${badge.color}`} style={{ width: `${p.accuracy}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-cyan-200">{p.accuracy}% accuracy</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => router.push("/home")}
            className="mt-8 w-full max-w-sm rounded-2xl bg-cyan-400 px-6 py-3 text-lg font-bold text-indigo-950 shadow-xl transition-transform hover:scale-105"
          >
            Back to base
          </button>
        </>
      )}
    </div>
  );
}
