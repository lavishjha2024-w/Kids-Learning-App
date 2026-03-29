import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useApp } from "@/context/AppContext";

const BreakReminder = () => {
  const { showBreakReminder, setShowBreakReminder, settings, resetFocusTimer } = useApp();
  const [timeLeft, setTimeLeft] = useState(settings.breakDuration * 60);
  const [phase, setPhase] = useState<"remind" | "breathing">("remind");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (showBreakReminder) {
      setTimeLeft(settings.breakDuration * 60);
      setPhase("remind");
      setPaused(false);
    }
  }, [showBreakReminder, settings.breakDuration]);

  useEffect(() => {
    if (!showBreakReminder || phase !== "breathing" || paused) return;
    if (timeLeft <= 0) {
      resetFocusTimer();
      setShowBreakReminder(false);
      setPhase("remind");
      return;
    }
    const timer = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [showBreakReminder, phase, timeLeft, paused, setShowBreakReminder, resetFocusTimer]);

  const handleClose = () => {
    resetFocusTimer();
    setShowBreakReminder(false);
    setPhase("remind");
    setPaused(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AnimatePresence>
      {showBreakReminder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/25 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="break-title"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-hover border border-border/50"
          >
            {phase === "remind" ? (
              <>
                <div className="text-6xl mb-4" aria-hidden>
                  🌤️
                </div>
                <h2 id="break-title" className="kids-heading text-2xl mb-2">
                  Time for a short break
                </h2>
                <p className="text-muted-foreground mb-6 text-balance">
                  You’ve been doing amazing work. Let’s rest your eyes and wiggle your body for a bit.
                </p>
                <button
                  type="button"
                  onClick={() => setPhase("breathing")}
                  className="kids-btn-primary w-full"
                >
                  Start a calm break 🧘
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-4 w-full kids-btn-secondary text-base"
                >
                  I’ll rest later — keep learning
                </button>
              </>
            ) : (
              <>
                <h2 className="kids-heading text-xl mb-4">Breathe slowly with Owly</h2>
                <motion.div
                  animate={paused ? undefined : { scale: [1, 1.22, 1] }}
                  transition={paused ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 mx-auto rounded-full bg-kids-mint flex items-center justify-center mb-6"
                >
                  <span className="text-3xl" aria-hidden>
                    😌
                  </span>
                </motion.div>
                <p className="text-muted-foreground mb-2">In… and out… You’re safe here.</p>
                <p className="text-3xl font-bold text-foreground tabular-nums mb-4" aria-live="polite">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    className="kids-btn-secondary flex-1 min-w-[120px] text-base"
                  >
                    {paused ? (
                      <>
                        <Play size={18} /> Resume
                      </>
                    ) : (
                      <>
                        <Pause size={18} /> Pause
                      </>
                    )}
                  </button>
                  <button type="button" onClick={handleClose} className="kids-btn-primary flex-1 min-w-[120px] text-base">
                    Done — I’m ready
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BreakReminder;
