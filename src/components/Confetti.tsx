const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#34d399", "#60a5fa", "#fbbf24"];

export default function Confetti() {
  const pieces = Array.from({ length: 36 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 137) % 100}%`,
            backgroundColor: COLORS[i % COLORS.length],
            animationDuration: `${2 + ((i * 71) % 30) / 10}s`,
            animationDelay: `${(i * 53) % 20 / 10}s`,
          }}
        />
      ))}
    </div>
  );
}
