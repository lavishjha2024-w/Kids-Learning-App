import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { playSound } from "@/lib/sounds";

interface PairRow {
  creature: string;
  treat: string;
  id: string;
}

const ROUNDS: PairRow[][] = [
  [
    { id: "c1", creature: "🐱", treat: "🐟" },
    { id: "c2", creature: "🐰", treat: "🥕" },
    { id: "c3", creature: "🐶", treat: "🦴" },
  ],
  [
    { id: "c4", creature: "🐼", treat: "🎋" },
    { id: "c5", creature: "🐵", treat: "🍌" },
    { id: "c6", creature: "🦉", treat: "🧀" },
  ],
];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const DragMatchGame = () => {
  const { incrementGameStat, addBadge, settings } = useApp();
  const [round, setRound] = useState(0);
  const cropairs = ROUNDS[round % ROUNDS.length];
  const [shuffledTreats, setShuffledTreats] = useState<string[]>(() =>
    shuffle(ROUNDS[0].map((p) => p.treat)),
  );
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedCreature, setSelectedCreature] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [completedRound, setCompletedRound] = useState(false);

  useEffect(() => {
    const p = ROUNDS[round % ROUNDS.length];
    setAssignments({});
    setSelectedCreature(null);
    setToast(null);
    setCompletedRound(false);
    setShuffledTreats(shuffle(p.map((x) => x.treat)));
  }, [round]);

  const showMessage = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onCreatureTap = (id: string) => {
    playSound("tap", settings.soundEnabled);
    setSelectedCreature(id);
    setToast(null);
  };

  const onTreatTap = (treat: string) => {
    if (!selectedCreature) {
      showMessage("Pick a friend first, then their snack!");
      playSound("hint", settings.soundEnabled);
      return;
    }
    playSound("tap", settings.soundEnabled);
    const row = cropairs.find((p) => p.id === selectedCreature);
    if (!row) return;
    if (row.treat === treat) {
      playSound("success", settings.soundEnabled);
      const next = { ...assignments, [selectedCreature]: treat };
      setAssignments(next);
      setSelectedCreature(null);
      if (Object.keys(next).length === cropairs.length) {
        setCompletedRound(true);
        incrementGameStat("drag-match", true);
        addBadge("match-maker");
        playSound("complete", settings.soundEnabled);
      }
    } else {
      playSound("hint", settings.soundEnabled);
      showMessage("Not quite — try a different snack. You’ve got this!");
      setSelectedCreature(null);
    }
  };

  const nextRound = () => setRound((r) => (r + 1) % ROUNDS.length);

  return (
    <div className="space-y-6">
      <p className="text-center text-muted-foreground font-semibold text-balance">
        Tap a friend, then tap their favorite snack.
      </p>
      {toast && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm font-bold text-foreground bg-kids-yellow/40 rounded-2xl py-2 px-3"
        >
          {toast}
        </motion.p>
      )}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Friends</p>
          <div className="space-y-2">
            {cropairs.map((p) => {
              const done = assignments[p.id] !== undefined;
              const sel = selectedCreature === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onCreatureTap(p.id)}
                  disabled={done}
                  className={`w-full kids-card py-4 text-4xl transition-all ${
                    done ? "ring-2 ring-kids-mint opacity-90" : ""
                  } ${sel ? "ring-4 ring-primary scale-[1.02]" : ""} disabled:cursor-default`}
                >
                  {p.creature}
                  {done && <span className="text-lg ml-2">{assignments[p.id]}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Snacks</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {shuffledTreats.map((treat, i) => {
              const used = Object.values(assignments).includes(treat);
              return (
                <motion.button
                  key={`${treat}-${i}`}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  disabled={used}
                  onClick={() => onTreatTap(treat)}
                  className={`kids-card py-4 px-5 text-4xl min-w-[72px] ${
                    used ? "opacity-30 pointer-events-none" : "kids-card-interactive"
                  }`}
                >
                  {treat}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
      {completedRound && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="font-bold text-lg mb-3">You fed every friend — awesome teamwork!</p>
          <button type="button" onClick={nextRound} className="kids-btn-primary">
            Next friends 🌟
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default DragMatchGame;
