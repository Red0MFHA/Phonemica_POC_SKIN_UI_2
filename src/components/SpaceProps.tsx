"use client";

import { useId, type ReactElement } from "react";

// Real vector-drawn props for the Cosmic Defense shooter.
// Each threat kind maps to an SVG sprite; emoji strings are the fallback.
// Gradient ids are uniqified with useId() so multiple sprites on screen never clash.

export function Asteroid({ className = "" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gid = `ast-${uid}`;
  return (
    <svg viewBox="0 0 96 96" className={className} role="img" aria-label="asteroid">
      <defs>
        <radialGradient id={gid} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#b9b1a4" />
          <stop offset="55%" stopColor="#8a8175" />
          <stop offset="100%" stopColor="#4e473f" />
        </radialGradient>
      </defs>
      <ellipse cx="48" cy="54" rx="34" ry="30" fill="#2b2622" opacity="0.55" />
      <path
        d="M28 30 Q38 18 58 22 Q76 25 74 44 Q80 60 66 68 Q52 80 34 74 Q18 66 22 48 Q20 36 28 30 Z"
        fill={`url(#${gid})`}
        stroke="#2f2a24"
        strokeWidth="2"
      />
      <ellipse cx="40" cy="44" rx="9" ry="6" fill="#6b6357" />
      <ellipse cx="62" cy="56" rx="7" ry="5" fill="#6b6357" />
      <ellipse cx="46" cy="62" rx="6" ry="4" fill="#5b5347" />
      <ellipse cx="56" cy="36" rx="5" ry="4" fill="#7d7467" />
    </svg>
  );
}

export function Meteor({ className = "" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gid = `met-${uid}`;
  return (
    <svg viewBox="0 0 96 96" className={className} role="img" aria-label="meteor">
      <defs>
        <radialGradient id={gid} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="45%" stopColor="#f0a84e" />
          <stop offset="100%" stopColor="#b35420" />
        </radialGradient>
      </defs>
      <ellipse cx="48" cy="54" rx="34" ry="30" fill="#3a2a12" opacity="0.45" />
      <path
        d="M26 34 Q34 20 56 20 Q74 24 74 44 Q76 62 60 70 Q42 78 28 66 Q16 54 22 42 Q20 36 26 34 Z"
        fill={`url(#${gid})`}
        stroke="#7a3a12"
        strokeWidth="2"
      />
      <ellipse cx="42" cy="42" rx="8" ry="5" fill="#ffd274" />
      <ellipse cx="60" cy="52" rx="7" ry="4" fill="#ffb453" />
      <path d="M22 62 Q12 72 4 66" stroke="#f0a84e" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M18 56 Q6 58 2 50" stroke="#ffd274" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

export function Comet({ className = "" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gid = `com-${uid}`;
  return (
    <svg viewBox="0 0 96 96" className={className} role="img" aria-label="comet">
      <defs>
        <radialGradient id={gid} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#dffcff" />
          <stop offset="55%" stopColor="#7fd6f2" />
          <stop offset="100%" stopColor="#2a7bd6" />
        </radialGradient>
      </defs>
      <path d="M72 16 Q82 12 88 20 Q80 24 72 26 Z" fill="#9fe2ff" opacity="0.95" />
      <circle cx="44" cy="46" r="18" fill={`url(#${gid})`} stroke="#1f5f9e" strokeWidth="2" />
      <circle cx="52" cy="40" r="4" fill="#eafcff" />
      <path d="M62 48 Q74 58 80 76" stroke="#9fe2ff" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M60 42 Q78 44 94 54" stroke="#c8f2ff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

export function Saucer({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} role="img" aria-label="saucer">
      <ellipse cx="48" cy="62" rx="34" ry="10" fill="#3f4854" />
      <path d="M14 60 Q20 40 48 40 Q76 40 82 60 L76 64 Q48 74 20 64 Z" fill="#a8c4d8" stroke="#6b8494" strokeWidth="2" />
      <path d="M20 60 Q48 66 76 60" stroke="#7fd6f2" strokeWidth="3" fill="none" opacity="0.9" />
      <path d="M48 40 Q48 22 48 18 M42 34 Q34 30 28 36 M54 34 Q62 30 68 36" stroke="#9fe2ff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Drone({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} role="img" aria-label="drone">
      <path d="M26 46 Q46 38 70 46 L64 62 Q48 70 32 62 Z" fill="#7c5bb8" stroke="#4a3572" strokeWidth="2" />
      <ellipse cx="48" cy="54" rx="14" ry="11" fill="#9c7ce0" />
      <circle cx="42" cy="52" r="2.6" fill="#16121f" />
      <circle cx="54" cy="52" r="2.6" fill="#16121f" />
      <path d="M30 30 Q18 22 16 14 M64 32 Q76 24 80 16 M34 26 Q28 34 26 26 M62 28 Q68 34 68 26" stroke="#7c5bb8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
    </svg>
  );
}

export function Bullet({ className = "" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gid = `bul-${uid}`;
  return (
    <svg viewBox="0 0 28 64" className={className} role="img" aria-label="laser bolt">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfffff" />
          <stop offset="60%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>
      <path
        d="M14 2 Q22 16 22 30 Q22 46 14 62 Q6 46 6 30 Q6 16 14 2 Z"
        fill={`url(#${gid})`}
        stroke="#67e8f9"
        strokeWidth="2"
      />
      <ellipse cx="14" cy="26" rx="5" ry="9" fill="#eaffff" opacity="0.9" />
    </svg>
  );
}

export type ThreatKind = "rock" | "meteor" | "comet" | "saucer" | "drone";

export const THREAT_SPRITES: Record<ThreatKind, (props: { className?: string }) => ReactElement> = {
  rock: Asteroid,
  meteor: Meteor,
  comet: Comet,
  saucer: Saucer,
  drone: Drone,
};

export function ThreatSprite({ kind, fallback, className = "" }: { kind: ThreatKind; fallback: string; className?: string }) {
  const Sprite = THREAT_SPRITES[kind];
  if (!Sprite) return <div className={className}>{fallback}</div>;
  return <Sprite className={className} />;
}
