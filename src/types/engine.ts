export type ExerciseType =
  | "picture_naming"
  | "word_repetition"
  | "minimal_pair"
  | "sound_identification";

export type PhonemePosition = "initial" | "medial" | "final";

export interface Exercise {
  id: string;
  sessionId: string;
  type: ExerciseType;
  targetPhoneme: string;
  word: string;
  difficulty: number;
  position: PhonemePosition;
  prompt?: string;
  media?: { imageUrl?: string; audioUrl?: string };
  metadata?: { syllables?: number; wordLength?: number; ageRange?: string };
}

export type NextActionType =
  | "continue"
  | "retry"
  | "reduce_difficulty"
  | "increase_difficulty"
  | "change_exercise"
  | "change_phoneme";

export interface SpeechAnalysisResult {
  attemptId: string;
  expectedPhoneme: string;
  detectedPhoneme?: string;
  accuracy: number;
  correct: boolean;
  errorType?: "none" | "substitution" | "omission" | "distortion" | "unknown";
  confidence: number;
  nextAction?: {
    type: NextActionType;
    difficulty?: number;
  };
}

export interface Family {
  phoneme: string;
  words: string[];
}

export interface Level {
  id: string;
  index: number;
  title: string;
  difficulty: number;
  phoneme: string;
  zone: string;
}

export type AssessmentStatus = "declared" | "pending" | "diagnosed";

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  assessmentStatus: AssessmentStatus;
  targets: string[];
}

export interface Session {
  id: string;
  childId: string;
  gameId: string;
  status: "active" | "diagnostic" | "complete";
  currentLevelId?: string;
  isDiagnostic: boolean;
}

export interface LevelCompleteResult {
  stars: number;
  nextLevelId?: string;
  rewardLabel: string;
  mastered: boolean;
}

export interface ProgressPhoneme {
  phoneme: string;
  accuracy: number;
  mastery: "mastered" | "developing" | "needs_practice";
}

export interface SessionProgress {
  childId: string;
  sessionId: string;
  totalStars: number;
  phonemes: ProgressPhoneme[];
}