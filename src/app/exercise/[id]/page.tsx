"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Loader2, ArrowRight } from "lucide-react";
import { theme, difficultyZone, alienForPhoneme } from "@/config/game";
import { engineClient } from "@/services";
import { getGameState } from "@/lib/state";
import { createRecorder } from "@/lib/audio";
import BgZone from "@/components/BgZone";
import Confetti from "@/components/Confetti";
import type { Exercise } from "@/types/engine";

const EXERCISES_PER_LEVEL = 5;

// Each target sound looks like a different inbound threat the ship must shoot down.
const threatForPhoneme: Record<string, { threat: string; debris: string }> = {
  "/r/": { threat: "🪨", debris: "🪨💥" },
  "/s/": { threat: "☄️", debris: "☄️💥" },
  "/th/": { threat: "👾", debris: "👾💥" },
  "/k/": { threat: "🛸", debris: "🛸💥" },
  "/l/": { threat: "🪐", debris: "🪐💥" },
};

export default function ExercisePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [done, setDone] = useState(0);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | { correct: boolean; accuracy: number; retry: boolean; word: string }>(null);

  useEffect(() => {
    const sessionId = getGameState().sessionId;
    if (!sessionId) { router.replace("/home"); return; }
    engineClient.getNextExercise(sessionId).then(setExercise);
  }, [router]);

  if (!exercise) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-gradient-to-b ${theme.background} text-white`}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const current = exercise;
  const threat = threatForPhoneme[current.targetPhoneme] ?? { threat: "🪨", debris: "🪨💥" };

  async function record() {
    setRecording(true);
    const rec = createRecorder();
    await rec.start();
    await new Promise((r) => setTimeout(r, 1600));
    const blob = await rec.stop();
    setRecording(false);
    setBusy(true);
    const res = await engineClient.submitSpeech(current.sessionId, current.id, blob);
    setBusy(false);
    setResult({
      correct: res.correct,
      accuracy: Math.round(res.accuracy * 100),
      retry: !res.correct && res.nextAction?.type === "retry",
      word: current.word,
    });
  }

  async function advance(retrying: boolean) {
    const sessionId = getGameState().sessionId!;
    setResult(null);
    if (!retrying) {
      const newDone = done + 1;
      if (newDone >= EXERCISES_PER_LEVEL) {
        await engineClient.completeLevel(sessionId, params.id);
        router.push("/level-complete");
        return;
      }
      setDone(newDone);
      const ex = await engineClient.getNextExercise(sessionId);
      setExercise(ex);
    }
  }

  const zone = difficultyZone(exercise.difficulty);

  // Ship is "armed & aiming" while the child speaks, then fires on a correct read.
  const threatCleared = result?.correct ?? false;
  const shipHit = result !== null && !result.correct;

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b ${theme.background} p-6`}>
      <BgZone />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center">
        <div className="absolute top-4 left-0 right-0 flex items-center justify-center gap-1.5">
          {Array.from({ length: EXERCISES_PER_LEVEL }).map((_, i) => (
            <div key={i} className={`h-3 w-3 rounded-full transition-all ${i < done ? "scale-125 bg-cyan-400" : "bg-white/30"}`} />
          ))}
        </div>
        <p className="mb-2 text-sm font-bold text-cyan-200">{zone} · Incoming threat!</p>

        {/* Word + target the child must say (their "weapon") */}
        <div className="w-full max-w-sm rounded-2xl bg-indigo-950/60 px-6 py-4 text-center backdrop-blur">
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl drop-shadow-lg">{alienForPhoneme[exercise.targetPhoneme] ?? "👽"}</span>
            <div className="text-left">
              <div className="text-4xl font-black tracking-wide text-white uppercase drop-shadow-lg">{exercise.word}</div>
              <p className="text-sm font-semibold text-cyan-300">{exercise.prompt}</p>
            </div>
          </div>
        </div>

        {/* Battle stage: threat drops from above, ship defends from below */}
        <div className="relative mt-6 flex h-56 w-full max-w-sm flex-col items-center justify-between overflow-hidden">
          {/* threat / explosion */}
          <div key={exercise.id} className={`text-6xl drop-shadow-lg ${recording ? "animate-threat-fall" : ""} ${threatCleared ? "opacity-0" : ""}`}>
            {threatCleared ? threat.debris : threat.threat}
          </div>
          {threatCleared && <div className="absolute top-0 text-6xl animate-blast">💥</div>}
          {/* laser beam on a correct shot */}
          {threatCleared && <div className="animate-laser absolute left-1/2 top-1/2 h-1.5 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300 to-transparent" />}

          {/* ship */}
          <div className={`text-6xl drop-shadow-lg ${shipHit ? "animate-ship-shake" : recording || busy ? "animate-bob" : ""}`}>🚀</div>
          {shipHit && <div className="absolute bottom-0 text-6xl animate-blast">💥</div>}
        </div>

        {/* status line */}
        <p className="mt-2 text-sm font-semibold text-cyan-200">
          {recording ? "Charging lasers… say the word! 👂"
            : busy ? "Analyzing your speech… 🛰️"
            : shipHit ? "Direct hit! Say it again to fight back."
            : "Say the word to fire at the threat!"}
        </p>

        {/* Fire / mic button */}
        <button
          onClick={record}
          disabled={busy || recording}
          className={`relative mt-4 flex h-24 w-24 items-center justify-center rounded-full shadow-2xl transition-transform ${
            recording ? "scale-110 bg-red-500" : "bg-cyan-400 hover:scale-105"
          } ${busy ? "opacity-60" : ""}`}
        >
          {recording ? <Mic size={40} className="text-white" /> : busy ? <Loader2 className="animate-spin text-indigo-950" size={34} /> : <Mic size={40} className="text-indigo-950" />}
        </button>
      </div>

      {result && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-6" onClick={() => advance(result.retry)}>
          {result.correct && <Confetti />}
          <div className={`relative w-full max-w-md rounded-3xl bg-indigo-900 p-8 text-center shadow-2xl ${result.correct ? "animate-pop-in" : ""}`}>
            {result.correct ? (
              <>
                <div className="text-6xl animate-pop-in">🚀💥</div>
                <h2 className="mt-3 flex items-center justify-center gap-2 text-3xl font-black text-white">Threat destroyed! <span className="animate-bob inline-block">🎯</span></h2>
                <p className="mt-2 text-lg text-cyan-200">{result.word} — your shot landed perfectly!</p>
                <div className="mt-3 flex justify-center gap-1 text-3xl">
                  {Array.from({ length: result.accuracy >= 85 ? 3 : 2 }).map((_, i) => <span key={i} className="animate-pop-in" style={{ animationDelay: `${0.15 * i}s` }}>⭐</span>)}
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl animate-blast">💥</div>
                <h2 className="mt-3 text-3xl font-black text-white">Shields hit!</h2>
                <p className="mt-2 text-lg text-cyan-200">Almost — the ship needs one more shot. You&apos;ve got a second chance.</p>
                <p className="mt-3 text-cyan-300">{result.accuracy}% match</p>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); advance(result.retry); }}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 text-2xl font-bold text-indigo-950 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              {result.retry ? "Fire again" : result.correct ? "Next threat" : "Continue"} <ArrowRight size={26} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
