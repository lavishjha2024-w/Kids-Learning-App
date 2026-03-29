import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { playSound } from "@/lib/sounds";

type Dot = "🔴" | "🟢" | "🔵" | "🟡";

const COLORS: Dot[] = ["🔴", "🟢", "🔵", "🟡"];

function makePattern(): { seq: Dot[]; answer: Dot } {
  const a = COLORS[Math.floor(Math.random() * COLORS.length)];
  let b = COLORS[Math.floor(Math.random() * COLORS.length)];
  while (b === a) b = COLORS[Math.floor(Math.random() * COLORS.length)];
  const alternate = Math.random() > 0.45;
  if (alternate) {
    return { seq: [a, b, a, b], answer: a };
  }
  return { seq: [a, a, a], answer: a };
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const PatternGame = () => {
  const { incrementGameStat, addBadge, awardXp, settings } = useApp();
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const { seq, answer, options } = useMemo(() => {
    const pat = makePattern();
    return { ...pat, options: shuffle([...COLORS]) };
  }, [round]);

  const choose = (c: Dot) => {
    playSound("tap", settings.soundEnabled);
    if (c === answer) {
      playSound("success", settings.soundEnabled);
      setMessage("You spotted the pattern!");
      awardXp(8);
      incrementGameStat("pattern", true, { countTowardTotalGames: false, skipXpReward: true });
      addBadge("pattern-pro");
      window.setTimeout(() => {
        setMessage(null);
        setRound((r) => r + 1);
      }, 1500);
    } else {
      playSound("hint", settings.soundEnabled);
      setMessage("Try another color — you’re getting closer.");
      incrementGameStat("pattern", false, { countTowardTotalGames: false, skipXpReward: true });
      window.setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      <p className="font-semibold text-muted-foreground text-balance">What comes next in the pattern?</p>
      <div className="flex justify-center gap-2 flex-wrap min-h-[3rem] items-center">
        {seq.map((s, i) => (
          <span key={`${round}-${i}`} className="text-4xl" aria-hidden>
            {s}
          </span>
        ))}
        <motion.span
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-4xl w-12 h-12 rounded-xl border-2 border-dashed border-primary flex items-center justify-center bg-card/50"
          aria-hidden
        >
          ?
        </motion.span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((c) => (
          <motion.button
            key={`${round}-${c}`}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => choose(c)}
            className="kids-btn-secondary text-4xl !py-6"
          >
            {c}
          </motion.button>
        ))}
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-bold text-foreground bg-kids-lavender/40 rounded-2xl py-3 px-4"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default PatternGame;
