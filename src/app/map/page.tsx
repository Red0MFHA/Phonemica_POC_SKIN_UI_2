"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { theme, difficultyZone } from "@/config/game";
import { engineClient } from "@/services";
import { getGameState } from "@/lib/state";
import type { Level } from "@/types/engine";

export default function MapPage() {
  const router = useRouter();
  const [current, setCurrent] = useState<Level | null>(null);
  const [unlocked, setUnlocked] = useState(1);

  useEffect(() => {
    const sessionId = getGameState().sessionId;
    if (!sessionId) { router.replace("/home"); return; }
    engineClient.getCurrentLevel(sessionId).then((lv) => {
      setCurrent(lv);
      // Unlock levels incrementally for the demo.
      setUnlocked(lv ? lv.index : 1);
    });
  }, [router]);

  return (
    <div className={`flex min-h-screen flex-col items-center bg-gradient-to-b ${theme.background} p-6`}>
      <h1 className="mt-2 text-2xl font-black text-white">Star Map</h1>
      <p className="text-sm text-cyan-200">Chart a course to rescue your sounds</p>

      <div className="mt-8 flex w-full max-w-xs flex-col items-center gap-3">
        {[1, 2, 3, 4, 5].map((i) => {
          const isUnlocked = i <= unlocked;
          const isCurrent = current?.index === i;
          return (
            <button
              key={i}
              disabled={!isUnlocked}
              onClick={() => router.push(`/level/${i}`)}
              className={`w-full rounded-2xl px-5 py-3 text-left shadow-lg transition-transform ${
                isCurrent
                  ? "scale-105 border-2 border-cyan-400 bg-indigo-800"
                  : isUnlocked
                    ? "bg-indigo-900/80 hover:scale-105"
                    : "bg-indigo-950/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Level {i}</p>
                  <p className="text-xs text-cyan-200">
                    {difficultyZone(current?.index === i ? current.difficulty : 0.15 + (i - 1) * 0.2)}
                  </p>
                </div>
                <div className="text-3xl">{isUnlocked ? "🪐" : <Lock className="text-white/50" />}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
