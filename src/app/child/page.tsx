"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { theme, GAME_ID } from "@/config/game";
import BgZone from "@/components/BgZone";
import { engineClient } from "@/services";
import { setGameState } from "@/lib/state";

const PHONEMES = ["/r/", "/s/", "/th/", "/k/", "/l/"];

export default function ChildPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState(5);
  const [mode, setMode] = useState<"known" | "unsure">("unsure");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function toggle(p: string) {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  async function begin() {
    setBusy(true);
    // The skin does NOT decide phonemes — it either forwards the parent's declared
    // sounds or leaves them blank so the Engine runs a diagnostic.
    const child = await engineClient.createChild({
      name,
      age,
      declaredPhonemes: mode === "known" ? selected : [],
    });
    if (mode === "unsure") {
      // Parent is not sure → Engine runs a diagnostic. Create the session up front
      // (it is marked "diagnostic" because the child is pending) so the diagnostic
      // page has a sessionId to load exercises from — otherwise it bounces to /home.
      const session = await engineClient.createSession(child.id, GAME_ID);
      setGameState({ childId: child.id, sessionId: session.id });
      router.push("/diagnostic");
    } else {
      setGameState({ childId: child.id, sessionId: undefined });
      router.push("/home");
    }
  }

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b ${theme.background} p-6`}>
      <BgZone />
      <div className="relative z-10 flex w-full flex-col items-center">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-black text-white">Who&apos;s flying?</h1>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-cyan-200">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mina"
              className="w-full rounded-xl border border-blue-500 bg-white/90 px-4 py-3 text-indigo-950 outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-cyan-200">Age</span>
            <input
              type="number" min={3} max={12}
              value={age}
              onChange={(e) => setAge(+e.target.value)}
              className="w-full rounded-xl border border-blue-500 bg-white/90 px-4 py-3 text-indigo-950 outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium text-cyan-200">Do you (parent) know which sounds are tricky?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMode("unsure"); setSelected([]); }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${mode === "unsure" ? "border-cyan-400 bg-cyan-400 text-indigo-950" : "border-blue-500 text-white"}`}
              >
                Not sure
              </button>
              <button
                onClick={() => setMode("known")}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${mode === "known" ? "border-cyan-400 bg-cyan-400 text-indigo-950" : "border-blue-500 text-white"}`}
              >
                I know them
              </button>
            </div>
            {mode === "known" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {PHONEMES.map((p) => (
                  <button
                    key={p}
                    onClick={() => toggle(p)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${selected.includes(p) ? "border-cyan-400 bg-cyan-400 text-indigo-950" : "border-blue-500 text-white"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={begin}
            disabled={busy || !name}
            className="w-full rounded-2xl bg-cyan-400 px-6 py-3 text-lg font-bold text-indigo-950 shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
          >
            {busy ? "Launching…" : "Start rescue"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
