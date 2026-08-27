"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Loader2, Check, RotateCcw, ArrowRight } from "lucide-react";
import { theme, difficultyZone, alienForPhoneme } from "@/config/game";
import { engineClient } from "@/services";
import { getGameState } from "@/lib/state";
import { createRecorder } from "@/lib/audio";
import BgZone from "@/components/BgZone";
import Confetti from "@/components/Confetti";
import type { Exercise } from "@/types/engine";

const EXERCISES_PER_LEVEL = 5;

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
        // Level finished — Engine decides completion.
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

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b ${theme.background} p-6`}>
      <BgZone />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center">
        <div className="absolute top-4 left-0 right-0 flex items-center justify-center gap-1.5">
          {Array.from({ length: EXERCISES_PER_LEVEL }).map((_, i) => (
            <div key={i} className={`h-3 w-3 rounded-full transition-all ${i < done ? "scale-125 bg-cyan-400" : "bg-white/30"}`} />
          ))}
        </div>
        <p className="mb-3 text-sm font-bold text-cyan-200">{zone}</p>

        <div className={`text-7xl drop-shadow-lg ${recording ? "animate-bob" : "animate-floaty"}`}>
          {alienForPhoneme[exercise.targetPhoneme] ?? "👽"}
        </div>
        <p className="mt-4 text-lg text-cyan-200">{exercise.prompt ?? "Say the word"}</p>

        <div className="mt-2 text-6xl font-black tracking-wide text-white uppercase drop-shadow-lg">{exercise.word}</div>
        <p className="mt-2 text-base font-semibold text-cyan-300">{exercise.targetPhoneme}</p>

        <div className="relative mt-8">
          {recording && (
            <>
              <span className="animate-pulse-ring absolute -inset-2 rounded-full bg-red-400/40" />
              <span className="animate-pulse-ring absolute -inset-2 rounded-full bg-red-400/30" style={{ animationDelay: "0.4s" }} />
              <span className="animate-pulse-ring absolute -inset-2 rounded-full bg-red-400/20" style={{ animationDelay: "0.8s" }} />
            </>
          )}
          <button
            onClick={record}
            disabled={busy || recording}
            className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-2xl transition-transform ${
              recording ? "scale-110 bg-red-500" : "bg-cyan-400 hover:scale-105"
            } ${busy ? "opacity-60" : ""}`}
          >
            {recording ? <Mic size={44} className="text-white" /> : busy ? <Loader2 className="animate-spin text-indigo-950" size={36} /> : <Mic size={44} className="text-indigo-950" />}
          </button>
        </div>
        <p className="mt-4 text-base font-bold text-cyan-200">
          {recording ? "Listening… keep talking! 👂" : busy ? "The ship is scanning… 🛰️" : "Tap & say the word"}
        </p>
      </div>

      {result && (
        <div className={`fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-6`} onClick={() => advance(result.retry)}>
          {result.correct && <Confetti />}
          <div className={`relative w-full max-w-md rounded-3xl bg-indigo-900 p-8 text-center shadow-2xl ${result.correct ? "animate-pop-in" : ""}`}>
            {result.correct ? (
              <>
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white animate-pop-in`}><Check size={40} /></div>
                <h2 className="mt-4 text-3xl font-black text-white">Great job! 👏</h2>
                <p className="mt-2 text-lg text-cyan-200">{result.word} — spot on!</p>
                <div className="mt-3 flex justify-center gap-1 text-3xl">
                  {Array.from({ length: result.accuracy >= 85 ? 3 : 2 }).map((_, i) => <span key={i} className="animate-pop-in" style={{ animationDelay: `${0.15 * i}s` }}>⭐</span>)}
                </div>
              </>
            ) : (
              <>
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500 text-white animate-wiggle`}><RotateCcw size={36} /></div>
                <h2 className="mt-4 text-3xl font-black text-white">Almost there! 💪</h2>
                <p className="mt-2 text-lg text-cyan-200">Let&apos;s try this word again.</p>
                <p className="mt-3 text-cyan-300">{result.accuracy}% match</p>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); advance(result.retry); }}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 text-2xl font-bold text-indigo-950 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              {result.retry ? "Try again" : "Continue"} <ArrowRight size={26} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
