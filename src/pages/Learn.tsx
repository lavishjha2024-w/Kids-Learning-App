import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Progress } from "@/components/ui/progress";
import { playSound } from "@/lib/sounds";

type Module = "alphabets" | "numbers" | "shapes" | "colors" | "math" | null;

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const numbers = Array.from({ length: 10 }, (_, i) => i);

const EXAMPLE_WORDS: Record<string, string> = {
  A: "Apple",
  B: "Ball",
  C: "Cat",
  D: "Dog",
  E: "Elephant",
  F: "Fish",
  G: "Garden",
  H: "House",
  I: "Ice cream",
  J: "Jump",
  K: "Kite",
  L: "Lion",
  M: "Moon",
  N: "Nest",
  O: "Orange",
  P: "Pizza",
  Q: "Quiet",
  R: "Rainbow",
  S: "Sun",
  T: "Tree",
  U: "Umbrella",
  V: "Violin",
  W: "Water",
  X: "Xylophone",
  Y: "Yellow",
  Z: "Zebra",
};

const shapes = [
  { name: "Circle", emoji: "🔵", color: "bg-kids-blue" },
  { name: "Square", emoji: "🟧", color: "bg-kids-peach" },
  { name: "Triangle", emoji: "🔺", color: "bg-kids-pink" },
  { name: "Star", emoji: "⭐", color: "bg-kids-yellow" },
  { name: "Heart", emoji: "❤️", color: "bg-kids-pink" },
  { name: "Diamond", emoji: "💎", color: "bg-kids-lavender" },
];

const colorCards = [
  { name: "Red", swatch: "bg-red-300", border: "border-red-400/50", emoji: "❤️" },
  { name: "Blue", swatch: "bg-sky-300", border: "border-sky-400/50", emoji: "💙" },
  { name: "Yellow", swatch: "bg-yellow-200", border: "border-yellow-400/50", emoji: "💛" },
  { name: "Green", swatch: "bg-green-300", border: "border-green-400/50", emoji: "💚" },
  { name: "Orange", swatch: "bg-orange-300", border: "border-orange-400/50", emoji: "🧡" },
  { name: "Purple", swatch: "bg-purple-300", border: "border-purple-400/50", emoji: "💜" },
  { name: "Pink", swatch: "bg-pink-300", border: "border-pink-400/50", emoji: "🌸" },
  { name: "Brown", swatch: "bg-amber-800/40", border: "border-amber-900/30", emoji: "🤎" },
];

const modules: {
  id: Module;
  title: string;
  emoji: string;
  color: string;
  desc: string;
}[] = [
  { id: "alphabets", title: "Alphabet", emoji: "🔤", color: "bg-kids-blue", desc: "Letters & sounds" },
  { id: "numbers", title: "Numbers", emoji: "🔢", color: "bg-kids-mint", desc: "Count with me" },
  { id: "shapes", title: "Shapes", emoji: "🎨", color: "bg-kids-lavender", desc: "See the shapes" },
  { id: "colors", title: "Colors", emoji: "🌈", color: "bg-kids-peach", desc: "Name the rainbow" },
  { id: "math", title: "Math play", emoji: "➕", color: "bg-kids-yellow", desc: "Add & multiply" },
];

function rnd(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function mathChoices(answer: number): number[] {
  const pool = new Set<number>([answer]);
  while (pool.size < 3) {
    const d = rnd(Math.max(0, answer - 4), answer + 4);
    if (d !== answer) pool.add(d);
  }
  return [...pool].sort(() => Math.random() - 0.5);
}

function genMathProblem(tier: number): { text: string; answer: number; hint: string } {
  if (tier >= 4) {
    const a = rnd(2, 5);
    const b = rnd(2, 5);
    return {
      text: `${a} × ${b}`,
      answer: a * b,
      hint: `Think of ${a} groups of ${b} — you can count by ${a}s!`,
    };
  }
  if (tier >= 3) {
    if (Math.random() > 0.45) {
      const a = rnd(5, 15);
      const b = rnd(1, Math.min(8, 20 - a));
      const ans = a + b;
      return { text: `${a} + ${b}`, answer: ans, hint: `Start at ${a}, count up ${b} more.` };
    }
    /** subtraction */
    const a = rnd(8, 18);
    const b = rnd(1, a - 1);
    return { text: `${a} − ${b}`, answer: a - b, hint: `Imagine taking ${b} away from ${a}.` };
  }
  if (tier >= 2) {
    const a = rnd(1, 9);
    const b = rnd(1, 9);
    return { text: `${a} + ${b}`, answer: a + b, hint: `Try counting: ${a}, then ${b} more steps.` };
  }
  const a = rnd(1, 5);
  const b = rnd(1, 5);
  return { text: `${a} + ${b}`, answer: a + b, hint: `Use your fingers or dots in your mind!` };
}

const encouragements = [
  "Bright thinking!",
  "You’re on a roll!",
  "Lovely focus!",
  "Growing stronger!",
  "That’s the spirit!",
];

const Learn = () => {
  const navigate = useNavigate();
  const { completeLesson, addBadge, settings, adaptive, registerMathResult, awardXp } = useApp();
  const [activeModule, setActiveModule] = useState<Module>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mathSolved, setMathSolved] = useState(0);
  const [mathProblemKey, setMathProblemKey] = useState(0);
  const [mathWrong, setMathWrong] = useState(0);
  const [showMathHint, setShowMathHint] = useState(false);
  const mathProblem = useMemo(() => genMathProblem(adaptive.mathTier), [adaptive.mathTier, mathProblemKey]);
  const mathChoicesList = useMemo(() => mathChoices(mathProblem.answer), [mathProblem]);

  const speak = (text: string) => {
    if (!settings.soundEnabled) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.82;
    u.pitch = 1.05;
    speechSynthesis.speak(u);
  };

  const eco = () => encouragements[Math.floor(Math.random() * encouragements.length)];

  const finishMath = useCallback(() => {
    completeLesson("math");
    setActiveModule(null);
    setMathSolved(0);
    setMathProblemKey(0);
    setMathWrong(0);
    setShowMathHint(false);
    playSound("complete", settings.soundEnabled);
  }, [completeLesson, settings.soundEnabled]);

  const handleNext = (total: number) => {
    playSound("tap", settings.soundEnabled);
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (activeModule && activeModule !== "math") {
      completeLesson(activeModule);
      if (activeModule === "colors") addBadge("colors-master");
      else addBadge(`${activeModule}-master`);
      playSound("complete", settings.soundEnabled);
      setActiveModule(null);
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      playSound("tap", settings.soundEnabled);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMathPick = (n: number) => {
    if (n === mathProblem.answer) {
      registerMathResult(true);
      awardXp(10);
      playSound("success", settings.soundEnabled);
      setMathWrong(0);
      setShowMathHint(false);
      if (mathSolved + 1 >= 5) {
        finishMath();
        return;
      }
      setMathSolved((s) => s + 1);
      setMathProblemKey((k) => k + 1);
    } else {
      registerMathResult(false);
      playSound("hint", settings.soundEnabled);
      setMathWrong((w) => w + 1);
      if (mathWrong + 1 >= 2) setShowMathHint(true);
    }
  };

  if (!activeModule) {
    return (
      <div className="page-container">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground mb-4 font-semibold min-h-[44px]"
        >
          <ArrowLeft size={20} aria-hidden /> Home
        </button>
        <h1 className="kids-heading text-3xl sm:text-4xl mb-2">Learn & wander</h1>
        <p className="text-muted-foreground font-semibold mb-6 max-w-xl">
          Tap a path — we’ll cheer you on the whole way.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m, i) => (
            <motion.button
              key={m.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => {
                setActiveModule(m.id);
                setCurrentIndex(0);
                setMathSolved(0);
                setMathProblemKey(0);
                setMathWrong(0);
                setShowMathHint(false);
              }}
              className="kids-card-interactive text-left border border-border/50"
            >
              <span className="text-5xl block mb-3" aria-hidden>
                {m.emoji}
              </span>
              <h3 className="font-bold text-xl">{m.title}</h3>
              <p className="text-sm text-muted-foreground font-semibold">{m.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const totalNonMath =
    activeModule === "alphabets"
      ? 26
      : activeModule === "numbers"
        ? 10
        : activeModule === "shapes"
          ? shapes.length
          : activeModule === "colors"
            ? colorCards.length
            : 0;

  const progressPct =
    activeModule === "math" ? (mathSolved / 5) * 100 : ((currentIndex + 1) / totalNonMath) * 100;

  const renderContent = () => {
    if (activeModule === "alphabets") {
      const letter = alphabets[currentIndex];
      const word = EXAMPLE_WORDS[letter] ?? "something fun";
      return (
        <div className="text-center px-1">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-44 h-44 mx-auto bg-kids-blue/90 rounded-[2rem] flex items-center justify-center mb-4 shadow-soft border border-white/40"
          >
            <span className="text-8xl font-black text-foreground">{letter}</span>
          </motion.div>
          <p className="text-sm font-bold text-muted-foreground mb-1">
            {letter} is for {word}
          </p>
          <button
            type="button"
            onClick={() => speak(`${letter}. ${letter} is for ${word}`)}
            className="kids-btn-primary"
          >
            <Volume2 size={20} aria-hidden /> Hear it
          </button>
        </div>
      );
    }

    if (activeModule === "numbers") {
      const num = numbers[currentIndex];
      return (
        <div className="text-center">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-44 h-44 mx-auto bg-kids-mint/90 rounded-[2rem] flex items-center justify-center mb-4 shadow-soft"
          >
            <span className="text-8xl font-black text-foreground">{num}</span>
          </motion.div>
          <p className="text-lg font-bold mb-2">Count: {num}</p>
          <button type="button" onClick={() => speak(String(num))} className="kids-btn-secondary">
            <Volume2 size={20} aria-hidden /> Hear it
          </button>
        </div>
      );
    }

    if (activeModule === "shapes") {
      const shape = shapes[currentIndex];
      return (
        <div className="text-center">
          <motion.div
            key={currentIndex}
            initial={{ rotate: -8, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className={`w-44 h-44 mx-auto ${shape.color} rounded-[2rem] flex items-center justify-center mb-4 shadow-soft`}
          >
            <span className="text-8xl">{shape.emoji}</span>
          </motion.div>
          <p className="text-xl font-bold mb-2">{shape.name}</p>
          <button type="button" onClick={() => speak(shape.name)} className="kids-btn-accent">
            <Volume2 size={20} aria-hidden /> Hear it
          </button>
        </div>
      );
    }

    if (activeModule === "colors") {
      const c = colorCards[currentIndex];
      return (
        <div className="text-center">
          <motion.div
            key={currentIndex}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`w-44 h-44 mx-auto rounded-[2rem] ${c.swatch} border-4 ${c.border} flex items-center justify-center mb-4 shadow-soft mx-auto`}
          >
            <span className="text-7xl">{c.emoji}</span>
          </motion.div>
          <p className="text-2xl font-black mb-2">{c.name}</p>
          <button type="button" onClick={() => speak(`This color is ${c.name}`)} className="kids-btn-peach">
            <Volume2 size={20} aria-hidden /> Hear the name
          </button>
        </div>
      );
    }

    if (activeModule === "math") {
      return (
        <div className="text-center space-y-4 max-w-md mx-auto">
          <p className="text-sm font-bold text-muted-foreground">
            Warm level {adaptive.mathTier} • Solve 5 friendly puzzles
          </p>
          <motion.div
            key={`${mathSolved}-${mathProblem.text}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="kids-card bg-kids-yellow/25 border border-border/50"
          >
            <p className="kids-heading text-4xl mb-2 tabular-nums">{mathProblem.text}</p>
            <p className="text-sm text-muted-foreground font-semibold">Tap the answer</p>
          </motion.div>
          {showMathHint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-bold bg-kids-mint/40 rounded-2xl py-2 px-3 flex items-center justify-center gap-2"
            >
              <Lightbulb size={18} aria-hidden /> {mathProblem.hint}
            </motion.p>
          )}
          <div className="grid grid-cols-3 gap-3">
            {mathChoicesList.map((n) => (
              <motion.button
                key={n}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => handleMathPick(n)}
                className="kids-btn-secondary text-2xl !py-5 tabular-nums"
              >
                {n}
              </motion.button>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="page-container">
      <button
        type="button"
        onClick={() => {
          setActiveModule(null);
          setMathSolved(0);
          setMathProblemKey(0);
          setMathWrong(0);
          setShowMathHint(false);
        }}
        className="flex items-center gap-2 text-muted-foreground mb-4 font-semibold min-h-[44px]"
      >
        <ArrowLeft size={20} aria-hidden /> All topics
      </button>

      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
          <span>Your path</span>
          <span>{activeModule === "math" ? `${mathSolved} / 5` : `${currentIndex + 1} / ${totalNonMath}`}</span>
        </div>
        <Progress value={Math.min(100, progressPct)} className="h-3 rounded-full" />
      </div>

      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>

      {activeModule !== "math" && (
        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="kids-btn-primary disabled:opacity-35"
          >
            <ChevronLeft size={24} aria-hidden />
            <span className="sr-only">Previous</span>
          </button>
          <span className="font-bold text-lg tabular-nums">
            {currentIndex + 1} / {totalNonMath}
          </span>
          <button type="button" onClick={() => handleNext(totalNonMath)} className="kids-btn-primary">
            {currentIndex === totalNonMath - 1 ? (
              "Finish 🌟"
            ) : (
              <>
                <span className="sr-only">Next</span>
                <ChevronRight size={24} aria-hidden />
              </>
            )}
          </button>
        </div>
      )}

      {activeModule !== "math" && (
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-6 text-muted-foreground font-bold"
        >
          {eco()} ✨
        </motion.p>
      )}
    </div>
  );
};

export default Learn;
