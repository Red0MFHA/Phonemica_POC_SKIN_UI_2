"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { theme, difficultyZone } from "@/config/game";
import { engineClient } from "@/services";
import { getGameState } from "@/lib/state";
import BgZone from "@/components/BgZone";
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
    <div className={`relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b ${theme.background} p-6`}>
      <BgZone />
      <div className="relative z-10 flex w-full max-w-xs flex-col items-center">
        <h1 className="mt-2 text-3xl font-black text-white drop-shadow">Defense Line 🚀</h1>
        <p className="mt-1 text-base text-cyan-200">Protect the ship — clear each hostile wave</p>

        <div className="mt-8 flex w-full flex-col items-center gap-4">
          {[1, 2, 3, 4, 5].map((i) => {
            const isUnlocked = i <= unlocked;
            const isCurrent = current?.index === i;
            const marker = ["☄️", "👾", "🪨", "🛸", "🌋"][i - 1];
            return (
              <button
                key={i}
                disabled={!isUnlocked}
                onClick={() => router.push(`/level/${i}`)}
                className={`w-full rounded-2xl px-6 py-4 text-left shadow-lg transition-transform ${
                  isCurrent
                    ? "scale-105 border-2 border-cyan-400 bg-indigo-800"
                    : isUnlocked
                      ? "bg-indigo-900/80 hover:scale-105 active:scale-95"
                      : "bg-indigo-950/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-white">Level {i}</p>
                    <p className="text-sm text-cyan-200">
                      {difficultyZone(current?.index === i ? current.difficulty : 0.15 + (i - 1) * 0.2)}
                    </p>
                  </div>
                  <div className="text-4xl">{isUnlocked ? marker : <Lock className="text-white/50" />}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
