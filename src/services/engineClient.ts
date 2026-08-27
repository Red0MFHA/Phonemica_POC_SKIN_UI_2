// The one Engine-facing interface both skins implement identically.
// This contract MUST stay identical between Jungle Quest and Cosmic Rescue.

import type {
  ChildProfile,
  Exercise,
  Level,
  LevelCompleteResult,
  Session,
  SessionProgress,
  SpeechAnalysisResult,
} from "@/types/engine";

export interface EngineClient {
  getChild(childId: string): Promise<ChildProfile | null>;
  createChild(input: { name: string; age: number; declaredPhonemes: string[] }): Promise<ChildProfile>;
  createSession(childId: string, gameId: string): Promise<Session>;
  getCurrentLevel(sessionId: string): Promise<Level | null>;
  getNextExercise(sessionId: string): Promise<Exercise>;
  submitSpeech(sessionId: string, exerciseId: string, audioBlob: Blob): Promise<SpeechAnalysisResult>;
  completeLevel(sessionId: string, levelId: string): Promise<LevelCompleteResult>;
  completeSession(sessionId: string): Promise<void>;
  getProgress(sessionId: string): Promise<SessionProgress>;
}
