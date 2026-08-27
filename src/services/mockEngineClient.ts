import type { EngineClient } from "./engineClient";
import type {
  ChildProfile,
  Exercise,
  ExerciseType,
  Level,
  LevelCompleteResult,
  PhonemePosition,
  ProgressPhoneme,
  Session,
  SessionProgress,
  SpeechAnalysisResult,
} from "@/types/engine";

const WORDS: Record<string, string[]> = {
  "/r/": ["rabbit", "robot", "rainbow", "rocket", "ring", "river"],
  "/s/": ["sun", "sand", "seven", "spoon", "star", "seat"],
  "/th/": ["three", "thumb", "thorn", "think", "thirsty", "thread"],
  "/k/": ["cat", "cake", "kite", "car", "key", "cup"],
  "/l/": ["lion", "leaf", "lamp", "ladder", "lamp", "lock"],
};

const POSITION_BY_PHONEME: Record<string, PhonemePosition> = {
  "/r/": "initial",
  "/s/": "initial",
  "/th/": "initial",
  "/k/": "initial",
  "/l/": "initial",
};

const TARGETS = ["/r/", "/th/", "/s/", "/k/", "/l/"];

function runId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 8)}`;
}

interface SessionState {
  session: Session;
  currentLevel: Level;
  levelIndex: number;
  exerciseIndex: number;
  stars: number;
  mastered: Set<string>;
  phonemeAccuracy: Record<string, { total: number; count: number }>;
  diagnosticIndex: number;
}

export class MockEngineClient implements EngineClient {
  private children = new Map<string, ChildProfile>();
  private states = new Map<string, SessionState>();
  private idCounter = 0;

  levels(): Level[] {
    return TARGETS.map((ph, i) => ({
      id: `lv-${i + 1}`,
      index: i + 1,
      title: `Level ${i + 1}`,
      difficulty: Math.round((0.15 + i * 0.2) * 100) / 100,
      phoneme: ph,
      zone: ["Easy Trail", "Forest Path", "Deep Jungle", "Challenge River", "Ancient Temple"][i] ?? `Level ${i + 1}`,
    }));
  }

  async getChild(childId: string): Promise<ChildProfile | null> {
    return this.children.get(childId) ?? null;
  }

  async createChild(input: { name: string; age: number; declaredPhonemes: string[] }): Promise<ChildProfile> {
    const child: ChildProfile = {
      id: runId("child"),
      name: input.name,
      age: input.age,
      // If the parent did not declare sounds, mark pending → a diagnostic run seeds targets.
      assessmentStatus: input.declaredPhonemes.length ? "declared" : "pending",
      targets: input.declaredPhonemes,
    };
    this.children.set(child.id, child);
    return child;
  }

  async createSession(childId: string, gameId: string): Promise<Session> {
    const child = this.children.get(childId)!;
    const isDiagnostic = child.assessmentStatus === "pending";
    // Engine decides progression start based on child age/profile.
    const levels = this.levels();
    const startIndex = Math.min(levels.length - 1, Math.floor(child.age / 3));
    const session: Session = {
      id: runId("sess"),
      childId,
      gameId,
      status: isDiagnostic ? "diagnostic" : "active",
      currentLevelId: levels[startIndex].id,
      isDiagnostic,
    };
    this.states.set(session.id, {
      session,
      currentLevel: levels[startIndex],
      levelIndex: startIndex,
      exerciseIndex: 0,
      stars: 0,
      mastered: new Set<string>(),
      phonemeAccuracy: {},
      diagnosticIndex: 0,
    });
    return session;
  }

  async getCurrentLevel(sessionId: string): Promise<Level | null> {
    return this.states.get(sessionId)?.currentLevel ?? null;
  }

  async getNextExercise(sessionId: string): Promise<Exercise> {
    const st = this.states.get(sessionId)!;
    let level = st.currentLevel;
    let exerciseIndex = st.exerciseIndex;

    // Diagnostic: cycle through ALL target phonemes.
    if (st.session.isDiagnostic) {
      const ph = TARGETS[st.diagnosticIndex % TARGETS.length];
      const diagLevel = { ...st.currentLevel, phoneme: ph };
      level = diagLevel;
      exerciseIndex = st.diagnosticIndex;
    }

    const pool = WORDS[level.phoneme] ?? WORDS["/s/"];
    const idx = exerciseIndex % pool.length;
    const word = pool[idx];
    const type = this.pickExerciseType(level.difficulty);
    const ex: Exercise = {
      id: runId("ex"),
      sessionId,
      type,
      targetPhoneme: level.phoneme,
      word,
      difficulty: level.difficulty,
      position: POSITION_BY_PHONEME[level.phoneme] ?? "initial",
      prompt: `Say ${word[0].toUpperCase() + word.slice(1)}`,
      metadata: { syllables: Math.max(1, Math.ceil(word.length / 3)), wordLength: word.length },
    };
    return ex;
  }

  private pickExerciseType(difficulty: number): ExerciseType {
    if (difficulty < 0.35) return "picture_naming";
    if (difficulty < 0.6) return "word_repetition";
    return "minimal_pair";
  }

  // Deterministic pseudo-attempt so the adaptive demo is reproducible.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- params exist only to match the Engine contract
  async submitSpeech(sessionId: string, _exerciseId: string, _audioBlob: Blob): Promise<SpeechAnalysisResult> {
    const st = this.states.get(sessionId)!;
    // Reconstruct which exercise was attempted (the Engine is the sole evaluator).
    const phoneme = st.session.isDiagnostic ? TARGETS[st.diagnosticIndex % TARGETS.length] : st.currentLevel.phoneme;
    const exercise = {
      targetPhoneme: phoneme,
      word: (WORDS[phoneme] ?? WORDS["/s/"])[st.exerciseIndex % (WORDS[phoneme]?.length ?? 1)],
      difficulty: st.currentLevel.difficulty,
    };
    const accuracy = st.session.isDiagnostic
      ? 0.4 + ((st.diagnosticIndex * 11) % 40) / 100 // varied across phonemes
      : this.computeAccuracy(st, exercise.targetPhoneme);
    const correct = accuracy >= 0.7;

    let nextAction: SpeechAnalysisResult["nextAction"];
    if (st.session.isDiagnostic) {
      // Diagnostic continues through the phoneme set regardless of accuracy.
      nextAction = { type: "continue" };
      st.diagnosticIndex += 1;
    } else if (correct) {
      nextAction = {
        type: exercise.difficulty > 0.6 ? "increase_difficulty" : "continue",
        difficulty: Math.min(1, Math.round((exercise.difficulty + 0.1) * 100) / 100),
      };
    } else {
      nextAction = { type: accuracy < 0.35 ? "reduce_difficulty" : "retry", difficulty: accuracy < 0.35 ? Math.max(0.1, exercise.difficulty - 0.15) : exercise.difficulty };
    }

    const rec = st.phonemeAccuracy[exercise.targetPhoneme] ?? { total: 0, count: 0 };
    rec.total += accuracy;
    rec.count += 1;
    st.phonemeAccuracy[exercise.targetPhoneme] = rec;
    st.exerciseIndex += 1;

    return {
      attemptId: runId("att"),
      expectedPhoneme: exercise.targetPhoneme,
      detectedPhoneme: correct ? exercise.targetPhoneme : this.substitute(exercise.targetPhoneme),
      accuracy,
      correct,
      errorType: correct ? "none" : "substitution",
      confidence: 0.6 + accuracy * 0.35,
      nextAction,
    };
  }

  private computeAccuracy(st: SessionState, phoneme: string): number {
    const attempt = st.exerciseIndex;
    const base = 0.45;
    const climb = Math.min(0.35, attempt * 0.05);
    const noise = ((attempt * 7) % 5) / 25;
    let acc = base + climb + noise;
    // Child starts weak on the /r/ level (the common FYP demo target).
    if (phoneme === "/r/" && st.levelIndex === 0) acc -= 0.12;
    return Math.max(0.1, Math.min(0.98, acc));
  }

  private substitute(phoneme: string): string {
    const map: Record<string, string> = { "/r/": "/w/", "/s/": "/ʃ/", "/th/": "/f/", "/k/": "/t/", "/l/": "/w/" };
    return map[phoneme] ?? "/x/";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- param exists only to match the Engine contract
  async completeLevel(sessionId: string, _levelId: string): Promise<LevelCompleteResult> {
    const st = this.states.get(sessionId)!;
    const rec = st.phonemeAccuracy[st.currentLevel.phoneme] ?? { total: 0.66, count: 1 };
    const avg = rec.count ? rec.total / rec.count : 0.66;
    const mastered = avg >= 0.75;
    if (mastered) st.mastered.add(st.currentLevel.phoneme);
    const stars = avg >= 0.85 ? 3 : avg >= 0.65 ? 2 : 1;
    st.stars += stars;

    const next = this.levels()[st.levelIndex + 1];
    st.exerciseIndex = 0;
    if (next) {
      st.levelIndex += 1;
      st.currentLevel = next;
      st.session.currentLevelId = next.id;
    }
    return {
      stars,
      nextLevelId: next?.id,
      rewardLabel: mastered ? "You found a hidden path!" : "Trail cleared",
      mastered,
    };
  }

  async completeSession(sessionId: string): Promise<void> {
    const st = this.states.get(sessionId);
    if (!st) return;
    if (st.session.isDiagnostic) {
      // The Engine converts the diagnostic run into a diagnosed profile.
      const child = this.children.get(st.session.childId);
      if (child) {
        const weakest = TARGETS
          .map((ph) => {
            const rec = st.phonemeAccuracy[ph];
            return { ph, acc: rec && rec.count ? rec.total / rec.count : 0.5 };
          })
          .sort((a, b) => a.acc - b.acc)
          .slice(0, 2);
        child.assessmentStatus = "diagnosed";
        child.targets = weakest.map((w) => w.ph);
      }
    }
  }

  async getProgress(sessionId: string): Promise<SessionProgress> {
    const st = this.states.get(sessionId)!;
    const phonemes: ProgressPhoneme[] = TARGETS.map((ph) => {
      const rec = st.phonemeAccuracy[ph];
      const acc = rec && rec.count ? rec.total / rec.count : 0;
      const mastery: ProgressPhoneme["mastery"] =
        st.mastered.has(ph) || acc >= 0.75 ? "mastered" : acc >= 0.5 ? "developing" : "needs_practice";
      return { phoneme: ph, accuracy: Math.round(acc * 100), mastery };
    });
    return { childId: st.session.childId, sessionId, totalStars: st.stars, phonemes };
  }
}
