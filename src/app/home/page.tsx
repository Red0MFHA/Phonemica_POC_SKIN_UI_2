"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme, alienForPhoneme, GAME_ID } from "@/config/game";
import { engineClient } from "@/services";
import { getGameState, setGameState } from "@/lib/state";
import type { ChildProfile } from "@/types/engine";

export default function HomePage() {
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = getGameState().childId;
    if (!id) return;
    engineClient.getChild(id).then(setChild);
  }, []);

  async function begin() {
    setBusy(true);
    const cid = getGameState().childId!;
    const session = await engineClient.createSession(cid, GAME_ID);
    setGameState({ sessionId: session.id });
    router.push("/map");
  }

  if (!child) {
    return <div className={`flex min-h-screen items-center justify-center bg-gradient-to-b ${theme.background} text-white`}>Loading…</div>;
  }

  return (
    <div className={`flex min-h-screen flex-col items-center bg-gradient-to-b ${theme.background} p-6`}>
      <div className="mt-6 text-center">
        <div className="text-5xl">{alienForPhoneme[child.targets[0] ?? "/r/"] ?? "👽"}</div>
        <h1 className="mt-2 text-2xl font-black text-white">Welcome, {child.name}!</h1>
        <p className="mt-1 text-cyan-200">The cosmos awaits a brave pilot.</p>
      </div>

      <div className="mt-8 w-full max-w-sm rounded-2xl bg-indigo-950/60 p-5 text-center backdrop-blur">
        <p className="text-sm font-medium text-cyan-200">Today&apos;s objective</p>
        <p className="mt-1 text-lg font-bold text-white">Reach the Nebula Core 🌠</p>
        {child.assessmentStatus === "pending" && (
          <p className="mt-2 rounded-lg bg-cyan-400/20 p-2 text-xs text-cyan-200">
            Scout test first — the ship will scan your special sounds.
          </p>
        )}
      </div>

      <button
        onClick={begin}
        disabled={busy}
        className="mt-10 rounded-2xl bg-cyan-400 px-10 py-3 text-lg font-bold text-indigo-950 shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
      >
        {busy ? "Preparing…" : "Begin 🛸"}
      </button>
    </div>
  );
}
