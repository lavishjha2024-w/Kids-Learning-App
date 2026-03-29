import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { playSound } from "@/lib/sounds";

const ROUNDS: { word: string; emoji: string; hint: string }[] = [
  { word: "CAT", emoji: "🐱", hint: "A soft friend says meow." },
  { word: "SUN", emoji: "☀️", hint: "Shines in the sky." },
  { word: "TREE", emoji: "🌳", hint: "Birds rest on its branches." },
  { word: "BOOK", emoji: "📚", hint: "Full of stories." },
  { word: "STAR", emoji: "⭐", hint: "Twinkles at night." },
];

const SpellGame = () => {
  const { incrementGameStat, addBadge, awardXp, settings } = useApp();
  const [i, setI] = useState(0);
  const round = ROUNDS[i % ROUNDS.length];

  const { display, correctLetter, choices } = useMemo(() => {
    const wi = Math.floor(Math.random() * round.word.length);
    const letter = round.word[wi];
    const wrongPool = "AEIOUBCDFGHJKLMNPQRSTVWXYZ".split("").filter((l) => l !== letter);
    const wrong = shuffle(wrongPool.filter((l) => !round.word.includes(l))).slice(0, 3);
    const merged = shuffle([letter, ...wrong.slice(0, 2)]);
    const display = round.word.slice(0, wi) + "_" + round.word.slice(wi + 1);
    return { display, correctLetter: letter, choices: merged };
  }, [i]);

  const [feedback, setFeedback] = useState<"ok" | "retry" | null>(null);

  const guess = useCallback(
    (letter: string) => {
      if (feedback) return;
      if (letter === correctLetter) {
        playSound("success", settings.soundEnabled);
        setFeedback("ok");
        awardXp(7);
        incrementGameStat("spell", true, { countTowardTotalGames: false, skipXpReward: true });
        addBadge("word-wizard");
      } else {
        playSound("hint", settings.soundEnabled);
        setFeedback("retry");
        incrementGameStat("spell", false, { countTowardTotalGames: false, skipXpReward: true });
      }
    },
    [feedback, correctLetter, settings.soundEnabled, awardXp, incrementGameStat, addBadge],
  );

  const nextWord = () => {
    setFeedback(null);
    setI((x) => x + 1);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="kids-card text-center">
        <span className="text-6xl block mb-2">{round.emoji}</span>
        <p className="text-sm text-muted-foreground font-semibold mb-2">{round.hint}</p>
        <p className="kids-heading text-3xl tracking-[0.35em]">{display}</p>
        <p className="text-xs text-muted-foreground mt-2">Pick the missing letter</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {choices.map((l) => (
          <motion.button
            key={`${i}-${l}`}
            type="button"
            whileTap={{ scale: 0.96 }}
            disabled={!!feedback}
            onClick={() => guess(l)}
            className="kids-btn-primary text-2xl !py-5"
          >
            {l}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`kids-card text-center font-bold ${feedback === "ok" ? "bg-kids-mint/35" : "bg-kids-peach/40"}`}
          >
            {feedback === "ok" ? (
              <>
                <p className="mb-3">Nice spelling — that word is shining! ✨</p>
                <button type="button" onClick={nextWord} className="kids-btn-secondary">
                  Next word
                </button>
              </>
            ) : (
              <>
                <p className="mb-3">Let’s try a different letter — you’re learning!</p>
                <button type="button" onClick={() => setFeedback(null)} className="kids-btn-secondary">
                  Try again
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default SpellGame;
