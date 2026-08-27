export const GAME_ID = "cosmic-rescue";

// Each skin exposes its own theme. The Engine only sends generic exercises;
// the skin maps engine difficulty into its own world.
export const theme = {
  name: "Cosmic Rescue",
  primary: "#4338ca",
  accent: "#22d3ee",
  background: "from-indigo-950 via-blue-900 to-violet-950",
  card: "bg-indigo-950/70 border-cyan-600",
  text: "text-cyan-100",
};

// difficulty 0..1 → space zone. Engine never knows these names.
export const difficultyZone = (difficulty: number): string => {
  if (difficulty < 0.2) return "🛰️ Orbit Dock";
  if (difficulty < 0.4) return "🌌 Asteroid Field";
  if (difficulty < 0.6) return "🪐 Ring Planet";
  if (difficulty < 0.8) return "☄️ Comet Trail";
  return "🌠 Nebula Core";
};

export const alienForPhoneme: Record<string, string> = {
  "/r/": "👽",
  "/s/": "🤖",
  "/th/": "🌙",
  "/k/": "🪐",
  "/l/": "🚀",
};

export const assets = {
  // Kenney assets dropped here; UI falls back to emoji if absent.
  background: "/game/cosmic/background.png",
  ship: "/game/cosmic/ship.png",
  character: "/game/cosmic/astronaut.png",
};
