"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme, alienForPhoneme, GAME_ID } from "@/config/game";
import { engineClient } from "@/services";
import { getGameState, setGameState } from "@/lib/state";
import BgZone from "@/components/BgZone";
import type { ChildProfile } from "@/types/engine";

export default function HomePage() {
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = getGameState().childId;
    if (!id) { router.replace("/welcome"); return; }
    engineClient.getChild(id).then((c) => {
      if (c) setChild(c);
      else router.replace("/welcome");
    });
  }, [router]);

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
    <div className={`relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b ${theme.background} p-6`}>
      <BgZone />
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center">
        <div className="mt-6 text-center">
          <div className="animate-floaty text-7xl drop-shadow-lg">{alienForPhoneme[child.targets[0] ?? "/r/"] ?? "👽"}</div>
          <h1 className="mt-3 text-3xl font-black text-white drop-shadow">Welcome, {child.name}!</h1>
          <p className="mt-2 text-lg text-cyan-200">Take the helm — the ship needs your voice.</p>
        </div>

        <div className="mt-8 w-full max-w-sm rounded-2xl bg-indigo-950/60 p-5 text-center backdrop-blur">
          <p className="text-sm font-semibold text-cyan-200">Today&apos;s objective</p>
          <p className="mt-1 text-xl font-bold text-white">Protect the ship in every wave 🛡️</p>
          {child.assessmentStatus === "pending" && (
            <p className="mt-2 rounded-lg bg-cyan-400/20 p-2 text-xs text-cyan-200">
              Scout test first — the ship will scan your special sounds.
            </p>
          )}
        </div>

        <button
          onClick={begin}
          disabled={busy}
          className="mt-10 rounded-2xl bg-cyan-400 px-12 py-4 text-2xl font-bold text-indigo-950 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {busy ? "Preparing…" : "Launch 🚀"}
        </button>
      </div>
    </div>
  );
}
