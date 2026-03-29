import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { playSound } from "@/lib/sounds";

const emojis = ["🐶", "🐱", "🐸", "🦋", "🌸", "🌈", "⭐", "🎵"];

export interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const createCards = (): Card[] => {
  const pairs = [...emojis, ...emojis];
  return pairs
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
};

const MemoryMatchGame = () => {
  const { incrementGameStat, addBadge, settings } = useApp();
  const [cards, setCards] = useState<Card[]>(() => createCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const rewardedRef = useRef(false);

  const startGame = useCallback(() => {
    rewardedRef.current = false;
    setCards(createCards());
    setSelected([]);
    setMoves(0);
    setWon(false);
  }, []);

  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    setMoves((m) => m + 1);

    if (cards[a].emoji === cards[b].emoji) {
      playSound("success", settings.soundEnabled);
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)),
        );
        setSelected([]);
      }, 400);
    } else {
      setTimeout(() => {
        setCards((prev) => prev.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c)));
        setSelected([]);
      }, 800);
    }
  }, [selected, cards, settings.soundEnabled]);

  useEffect(() => {
    if (cards.length === 0 || !cards.every((c) => c.matched)) return;
    if (rewardedRef.current) return;
    rewardedRef.current = true;
    setWon(true);
    incrementGameStat("memory", true);
    addBadge("memory-champion");
    playSound("complete", settings.soundEnabled);
  }, [cards, incrementGameStat, addBadge, settings.soundEnabled]);

  const handleFlip = (id: number) => {
    if (selected.length >= 2) return;
    if (cards[id].flipped || cards[id].matched) return;
    playSound("tap", settings.soundEnabled);
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    setSelected((prev) => [...prev, id]);
  };

  if (won) {
    return (
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8 px-2"
      >
        <span className="text-6xl block mb-4" aria-hidden>
          🎉
        </span>
        <h3 className="kids-heading text-2xl mb-2">You matched them all!</h3>
        <p className="text-muted-foreground mb-6 text-balance">What a great memory — want to play again?</p>
        <button type="button" onClick={startGame} className="kids-btn-primary">
          <RotateCcw size={18} /> Try another round
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="font-bold text-foreground">Moves: {moves}</span>
        <button type="button" onClick={startGame} className="kids-btn-secondary text-sm !px-4 !py-2 !min-h-[44px]">
          <RotateCcw size={16} /> New cards
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(card.id)}
            className={`aspect-square rounded-2xl text-3xl flex items-center justify-center font-bold transition-all duration-300 min-h-14 ${
              card.flipped || card.matched
                ? "bg-kids-mint shadow-soft"
                : "bg-kids-lavender/90 hover:bg-kids-lavender"
            } ${card.matched ? "opacity-70 ring-2 ring-kids-mint" : ""}`}
            aria-label={card.flipped || card.matched ? card.emoji : "Hidden card — tap to flip"}
          >
            {card.flipped || card.matched ? card.emoji : "?"}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MemoryMatchGame;
