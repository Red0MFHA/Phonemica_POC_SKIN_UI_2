"use client";

interface GameState {
  childId?: string;
  sessionId?: string;
}

const KEY = "cosmic-rescue-state";

export function getGameState(): GameState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as GameState;
  } catch {
    return {};
  }
}

export function setGameState(patch: GameState) {
  const cur = getGameState();
  const next = { ...cur, ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearGameState() {
  window.localStorage.removeItem(KEY);
}
