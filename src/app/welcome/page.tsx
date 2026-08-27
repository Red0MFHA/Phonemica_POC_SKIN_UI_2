"use client";

import { useRouter } from "next/navigation";
import { theme } from "@/config/game";

export default function WelcomePage() {
  const router = useRouter();
  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-gradient-to-b ${theme.background} p-6 text-center`}>
      <div className="text-6xl">🚀</div>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-lg">Cosmic Rescue</h1>
      <p className="mt-2 text-cyan-200">The Phoneme Rescue</p>
      <p className="mt-6 max-w-sm text-sm text-cyan-100/80">
        Pilot a rescue ship, befriend aliens, and bring your sounds home by using your voice.
      </p>
      <button
        onClick={() => router.push("/child")}
        className="mt-8 rounded-2xl bg-cyan-400 px-8 py-3 text-lg font-bold text-indigo-950 shadow-lg transition-transform hover:scale-105"
      >
        🛸 Tap to launch
      </button>
    </div>
  );
}
