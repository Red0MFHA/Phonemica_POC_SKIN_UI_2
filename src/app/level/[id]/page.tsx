"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme, difficultyZone, alienForPhoneme, GAME_ID } from "@/config/game";
import BgZone from "@/components/BgZone";
import { engineClient } from "@/services";
import { getGameState, setGameState } from "@/lib/state";
import type { Level } from "@/types/engine";

export default function LevelIntroPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const id = React.use(params).id;
  const [level, setLevel] = useState<Level | null>(null);

  useEffect(() => {
    const state = getGameState();
    const childId = state.childId;
    if (!childId) { router.replace("/welcome"); return; }
    const levelId = `lv-${id}`;
    (async () => {
      let sid = state.sessionId;
      if (!sid) {
        const s = await engineClient.createSession(childId, GAME_ID);
        sid = s.id;
        setGameState({ sessionId: sid });
      }
      let lv = await engineClient.selectLevel(sid!, levelId);
      if (!lv) {
        // Session existed in state but is missing from the store (e.g. stale
        // localStorage from an older build) — rebuild it so the level loads.
        const s = await engineClient.createSession(childId, GAME_ID);
        setGameState({ sessionId: s.id });
        lv = await engineClient.selectLevel(s.id, levelId);
      }
      if (lv) setLevel(lv);
      else router.replace("/home");
    })();
  }, [id, router]);

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b ${theme.background} p-6`}>
      <BgZone />
      <div className="relative z-10 flex w-full flex-col items-center">
      {level ? (
        <>
          <div className="text-6xl">{alienForPhoneme[level.phoneme] ?? "👽"}</div>
          <h1 className="mt-4 text-3xl font-black text-white">Level {level.index}</h1>
          <p className="mt-1 text-lg text-cyan-200">{difficultyZone(level.difficulty)}</p>
          <p className="mt-4 max-w-xs text-center text-sm text-cyan-100/80">
            Navigate the {level.phoneme} sector. Say the words to power your rescue ship!
          </p>
          <button
            onClick={() => router.push(`/exercise/${id}`)}
            className="mt-8 rounded-2xl bg-cyan-400 px-10 py-3 text-lg font-bold text-indigo-950 shadow-xl transition-transform hover:scale-105"
          >
            Start mission
          </button>
        </>
      ) : (
        <p className="text-white">Loading…</p>
      )}
      </div>
    </div>
  );
}
