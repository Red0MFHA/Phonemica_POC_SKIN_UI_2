const STARS = [
  { top: "8%", left: "6%", d: "0s" },
  { top: "14%", left: "88%", d: "0.4s" },
  { top: "24%", left: "12%", d: "0.8s" },
  { top: "32%", left: "80%", d: "1.1s" },
  { top: "48%", left: "4%", d: "0.6s" },
  { top: "58%", left: "92%", d: "1.5s" },
  { top: "66%", left: "10%", d: "0.9s" },
  { top: "72%", left: "86%", d: "1.3s" },
  { top: "18%", left: "50%", d: "1.8s" },
  { top: "82%", left: "30%", d: "0.2s" },
];

export default function BgZone() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* starfield */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="animate-twinkle absolute h-1.5 w-1.5 rounded-full bg-white"
          style={{ top: s.top, left: s.left, animationDelay: s.d }}
        />
      ))}

      {/* floating planets / rockets / asteroids */}
      <span className="animate-floaty absolute left-[6%] top-[16%] text-4xl opacity-80">🪐</span>
      <span className="animate-floaty absolute right-[8%] top-[24%] text-3xl opacity-70" style={{ animationDelay: "0.6s" }}>🚀</span>
      <span className="animate-floaty absolute left-[12%] bottom-[30%] text-4xl opacity-70" style={{ animationDelay: "1.2s" }}>🛸</span>
      <span className="animate-floaty absolute right-[12%] top-[60%] text-3xl opacity-70" style={{ animationDelay: "1.8s" }}>🌙</span>
      <span className="animate-twinkle absolute right-[4%] top-[8%] text-2xl opacity-80" style={{ animationDelay: "1s" }}>☄️</span>
      <span className="animate-floaty absolute left-1/2 top-[6%] -translate-x-1/2 text-3xl opacity-60" style={{ animationDelay: "2.2s" }}>👽</span>

      {/* corner nebula glows */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
    </div>
  );
}
