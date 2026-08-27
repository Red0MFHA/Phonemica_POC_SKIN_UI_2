"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Loader2 } from "lucide-react";
import { theme, alienForPhoneme } from "@/config/game";
import BgZone from "@/components/BgZone";
import { engineClient } from "@/services";
import { getGameState } from "@/lib/state";
import { createRecorder } from "@/lib/audio";
import type { Exercise } from "@/types/engine";

export default function DiagnosticPage() {
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [step, setStep] = useState(0);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<"correct" | "prompt" | null>(null);

  useEffect(() => {
    const sessionId = getGameState().sessionId;
    if (!sessionId) {
      router.replace("/home");
      return;
    }
    engineClient.getNextExercise(sessionId).then(setExercise);
  }, [router]);

  if (!exercise) {
    return <ScoutLoading />;
  }
  const current = exercise;

  async function record() {
    setRecording(true);
    setFlash("prompt");
    const rec = createRecorder();
    await rec.start();
    await new Promise((r) => setTimeout(r, 1600));
    const blob = await rec.stop();
    setRecording(false);
    setBusy(true);
    const result = await engineClient.submitSpeech(current.sessionId, current.id, blob);
    setBusy(false);
    setFlash(result.correct ? "correct" : (result.nextAction?.type === "retry" ? "prompt" : "correct"));
    await new Promise((r) => setTimeout(r, 700));
    setFlash(null);
    if (!result.correct && result.nextAction?.type === "retry") {
      // Retry same word — the Engine said so.
      return;
    }
    await next();
  }

  async function next() {
    const sessionId = getGameState().sessionId!;
    const ex = await engineClient.getNextExercise(sessionId);
    const progressed = step + 1 >= 8;
    if (progressed) {
      await engineClient.completeSession(sessionId);
      router.push("/map");
      return;
    }
    setStep((s) => s + 1);
    setExercise(ex);
  }

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b ${theme.background} p-6`}>
      <BgZone />
      <div className="relative z-10 flex w-full flex-col items-center">
      <div className="mb-4 text-4xl">{alienForPhoneme[exercise.targetPhoneme] ?? "👽"}</div>
      <h1 className="text-2xl font-black text-white">Cosmic Scan Test</h1>
      <p className="mt-1 text-sm text-cyan-200">Say the word to scan your special sounds</p>

      <div className="mt-6 text-center">
        <div className="text-6xl">{exercise.word[0].toUpperCase()}</div>
        <p className="mt-2 text-3xl font-bold tracking-wide text-white uppercase">{exercise.word}</p>
        <p className="mt-1 text-sm text-cyan-300">{exercise.targetPhoneme} sound</p>
      </div>

      <button
        onClick={record}
        disabled={busy || recording}
        className={`mt-8 flex h-24 w-24 items-center justify-center rounded-full shadow-xl transition-transform ${
          recording ? "scale-110 bg-red-500" : "bg-cyan-400 hover:scale-105"
        } ${busy ? "opacity-50" : ""}`}
      >
        {recording ? <Mic size={36} className="text-white" /> : busy ? <Loader2 className="animate-spin text-indigo-950" size={32} /> : <Mic size={36} className="text-indigo-950" />}
      </button>
      <p className="mt-3 text-sm font-medium text-cyan-200">
        {recording ? "Listening…" : busy ? "The ship is scanning…" : flash === "correct" ? "Great!" : "Hold and say the word"}
      </p>

      <div className="mt-8 flex gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`h-2.5 w-2.5 rounded-full ${i < step ? "bg-cyan-400" : "bg-white/30"}`} />
        ))}
      </div>
      </div>
    </div>
  );
}

function ScoutLoading() {
  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-gradient-to-b ${theme.background} text-white`}>
      <Loader2 className="animate-spin" size={32} />
      <p className="mt-3 text-cyan-200">Preparing the scan…</p>
    </div>
  );
}
