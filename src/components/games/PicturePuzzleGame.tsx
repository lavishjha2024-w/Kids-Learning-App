import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { playSound } from "@/lib/sounds";

/** Story order puzzle: tap two tiles to swap until the tale reads left-to-right. */
const STORIES = [
  { emojis: ["🌱", "🌧️", "🌸", "🦋"], caption: "Growing story" },
  { emojis: ["🥚", "🐣", "🐤", "🐔"], caption: "Life cycle" },
];

function shuffleArr<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const PicturePuzzleGame = () => {
  const { incrementGameStat, addBadge, settings } = useApp();
  const [storyIndex, setStoryIndex] = useState(0);
  const answer = STORIES[storyIndex].emojis;
  const [tiles, setTiles] = useState<string[]>(() => shuffleArr([...STORIES[0].emojis]));
  const [firstPick, setFirstPick] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [roundDone, setRoundDone] = useState(false);

  useEffect(() => {
    setTiles(shuffleArr([...STORIES[storyIndex].emojis]));
    setFirstPick(null);
    setToast(null);
    setRoundDone(false);
  }, [storyIndex]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  const onTileTap = (index: number) => {
    if (roundDone) return;
    playSound("tap", settings.soundEnabled);
    if (firstPick === null) {
      setFirstPick(index);
      return;
    }
    if (firstPick === index) {
      setFirstPick(null);
      return;
    }
    const newTiles = [...tiles];
    const a = firstPick;
    [newTiles[a], newTiles[index]] = [newTiles[index], newTiles[a]];
    setTiles(newTiles);
    setFirstPick(null);
    const ok = newTiles.every((t, i) => t === answer[i]);
    if (ok) {
      setRoundDone(true);
      playSound("complete", settings.soundEnabled);
      incrementGameStat("puzzle", true);
      addBadge("puzzle-master");
      showToast("Story in perfect order — you did it!");
    } else {
      playSound("hint", settings.soundEnabled);
    }
  };

  const nextStory = () => setStoryIndex((i) => (i + 1) % STORIES.length);

  return (
    <div className="space-y-4">
      <p className="text-center font-semibold text-muted-foreground text-balance">
        Put the story in order. Tap two tiles to swap them.
      </p>
      <p className="text-center text-sm font-bold text-foreground">{STORIES[storyIndex].caption}</p>
      {toast && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center font-bold text-kids-mint">
          {toast}
        </motion.p>
      )}
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
        {tiles.map((emoji, i) => (
          <motion.button
            key={`${storyIndex}-${i}-${emoji}`}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onTileTap(i)}
            className={`aspect-square rounded-2xl text-4xl flex items-center justify-center kids-card shadow-soft border-2 ${
              firstPick === i ? "border-primary ring-4 ring-primary/30" : "border-transparent"
            }`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      {roundDone && (
        <div className="text-center">
          <button type="button" onClick={nextStory} className="kids-btn-primary">
            Next story 📖
          </button>
        </div>
      )}
    </div>
  );
};

export default PicturePuzzleGame;
