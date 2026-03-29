import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { playSound } from "@/lib/sounds";

const QUESTIONS = [
  { q: "How many legs does a dog usually have?", em: "🐶", options: ["2", "4", "6"], a: 1 },
  { q: "What color do you get when you mix blue and yellow?", em: "🎨", options: ["Purple", "Green", "Orange"], a: 1 },
  { q: "Which is biggest?", em: "🌍", options: ["A house", "The moon", "A shoe"], a: 1 },
  { q: "What comes after Monday?", em: "📅", options: ["Sunday", "Tuesday", "Friday"], a: 1 },
];

const QuizGame = () => {
  const { incrementGameStat, addBadge, awardXp, settings } = useApp();
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<"yes" | "try" | null>(null);
  const [score, setScore] = useState(0);

  const question = QUESTIONS[idx % QUESTIONS.length];

  const pick = useCallback(
    (i: number) => {
      if (feedback) return;
      if (i === question.a) {
        playSound("success", settings.soundEnabled);
        setFeedback("yes");
        setScore((s) => {
          const n = s + 1;
          if (n >= 6) addBadge("quiz-hero");
          return n;
        });
        awardXp(5);
        incrementGameStat("quiz", true, { countTowardTotalGames: false, skipXpReward: true });
      } else {
        playSound("hint", settings.soundEnabled);
        setFeedback("try");
        incrementGameStat("quiz", false, { countTowardTotalGames: false, skipXpReward: true });
      }
    },
    [feedback, question, settings.soundEnabled, awardXp, incrementGameStat, addBadge],
  );

  const next = () => {
    setFeedback(null);
    setIdx((i) => i + 1);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="kids-card text-center">
        <span className="text-5xl block mb-2">{question.em}</span>
        <p className="font-bold text-lg text-balance">{question.q}</p>
      </div>
      <div className="grid gap-3">
        {question.options.map((opt, i) => (
          <motion.button
            key={opt}
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={!!feedback}
            onClick={() => pick(i)}
            className="kids-btn-secondary w-full text-left justify-start !py-4"
          >
            <span className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-sm font-black border border-border">
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`kids-card text-center font-bold ${
              feedback === "yes" ? "bg-kids-mint/40" : "bg-kids-yellow/40"
            }`}
          >
            {feedback === "yes" ? (
              <>
                <p className="text-lg mb-3">Yes! You thought it through! 🌟</p>
                <button type="button" onClick={next} className="kids-btn-primary">
                  Next question
                </button>
              </>
            ) : (
              <>
                <p className="text-lg mb-3">Hmm, let’s peek at another answer — no worries!</p>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="kids-btn-primary"
                >
                  Try again
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-center text-sm text-muted-foreground font-semibold">Stars this round: {score}</p>
    </div>
  );
};

export default QuizGame;
