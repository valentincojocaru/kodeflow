import { useEffect, useState, useRef } from "react";

const MESSAGES = [
  "Analyzing neural pathways...",
  "Optimizing code architecture...",
  "Generating AI solutions...",
  "Processing full-stack requests...",
  "Deploying production builds...",
  "Training on new patterns...",
  "Syncing distributed nodes...",
];

function useAnimatedInt(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, duration]);
  return val;
}

export default function BrainHUD() {
  const [blink, setBlink] = useState(true);
  const [msgIdx, setMsgIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [accuracy, setAccuracy] = useState(99.1);
  const [latency, setLatency] = useState(12);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nodes = useAnimatedInt(460, 1600);
  const conns = useAnimatedInt(1380, 2000);

  // Blinking status dot
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 520);
    return () => clearInterval(id);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const msg = MESSAGES[msgIdx];
    if (isTyping) {
      if (typed.length < msg.length) {
        typingRef.current = setTimeout(() => setTyped(msg.slice(0, typed.length + 1)), 38);
      } else {
        typingRef.current = setTimeout(() => setIsTyping(false), 1600);
      }
    } else {
      if (typed.length > 0) {
        typingRef.current = setTimeout(() => setTyped(t => t.slice(0, -1)), 18);
      } else {
        setMsgIdx(i => (i + 1) % MESSAGES.length);
        setIsTyping(true);
      }
    }
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [typed, isTyping, msgIdx]);

  // Fluctuating accuracy & latency
  useEffect(() => {
    const id = setInterval(() => {
      setAccuracy(+(99 + Math.random() * 0.95).toFixed(1));
      setLatency(Math.floor(8 + Math.random() * 9));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="w-full pointer-events-none select-none"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {/* Top status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t"
        style={{ borderColor: "rgba(100,180,255,0.12)", background: "rgba(5,3,20,0.55)" }}>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: blink ? "#4ade80" : "#166534",
              boxShadow: blink ? "0 0 6px #4ade80" : "none",
              transition: "all 0.15s",
            }}
          />
          <span className="text-[10px] tracking-widest uppercase"
            style={{ color: "rgba(100,220,160,0.85)" }}>
            Neural Network Active
          </span>
        </div>

        {/* Latency */}
        <span className="text-[10px] tracking-wider"
          style={{ color: "rgba(120,180,255,0.6)" }}>
          LATENCY&nbsp;
          <span style={{ color: "rgba(120,210,255,0.95)" }}>{latency}ms</span>
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x"
        style={{ divideColor: "rgba(100,140,255,0.1)", background: "rgba(3,2,16,0.6)" }}>
        {[
          { label: "NODES", value: nodes.toLocaleString(), color: "rgba(140,190,255,0.9)" },
          { label: "CONNECTIONS", value: conns.toLocaleString(), color: "rgba(180,130,255,0.9)" },
          { label: "ACCURACY", value: `${accuracy}%`, color: "rgba(100,230,180,0.9)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center py-2 gap-0.5"
            style={{ borderColor: "rgba(100,140,255,0.1)" }}>
            <span className="text-[9px] tracking-widest uppercase"
              style={{ color: "rgba(120,150,220,0.5)" }}>{label}</span>
            <span className="text-sm font-bold tabular-nums"
              style={{ color, textShadow: `0 0 12px ${color}` }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Typewriter line */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t"
        style={{
          borderColor: "rgba(100,140,255,0.1)",
          background: "rgba(2,1,14,0.7)",
        }}>
        <span className="text-[9px] tracking-widest"
          style={{ color: "rgba(100,180,255,0.4)" }}>SYS&gt;</span>
        <span className="text-[10px] tracking-wide"
          style={{ color: "rgba(160,220,255,0.75)" }}>
          {typed}
          <span
            className="inline-block w-[1px] h-[10px] align-middle ml-[1px]"
            style={{
              background: "rgba(160,220,255,0.8)",
              opacity: blink ? 1 : 0,
              transition: "opacity 0.1s",
            }}
          />
        </span>
      </div>
    </div>
  );
}
