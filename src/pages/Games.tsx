import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import MemoryMatchGame from "@/components/games/MemoryMatchGame";
import DragMatchGame from "@/components/games/DragMatchGame";
import PicturePuzzleGame from "@/components/games/PicturePuzzleGame";
import QuizGame from "@/components/games/QuizGame";
import PatternGame from "@/components/games/PatternGame";
import SpellGame from "@/components/games/SpellGame";

const gameTabs = [
  { id: "memory", label: "Memory", emoji: "🃏" },
  { id: "match", label: "Match", emoji: "🍎" },
  { id: "puzzle", label: "Puzzle", emoji: "🧩" },
  { id: "quiz", label: "Quiz", emoji: "❓" },
  { id: "pattern", label: "Pattern", emoji: "🔁" },
  { id: "spell", label: "Spell", emoji: "✏️" },
];

const Games = () => {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="kids-heading text-3xl sm:text-4xl mb-1">Play & explore</h1>
        <p className="text-muted-foreground font-semibold text-balance">
          Pick a mini-game — every try makes your brain stronger.
        </p>
      </motion.div>

      <Tabs defaultValue="memory" className="w-full">
        <TabsList
          className={cn(
            "w-full h-auto flex flex-wrap justify-start gap-2 rounded-2xl bg-muted/80 p-2 mb-6 border border-border/60",
          )}
        >
          {gameTabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-xl px-4 py-3 text-sm sm:text-base font-bold data-[state=active]:shadow-soft data-[state=active]:bg-card gap-1.5 min-h-[48px]"
            >
              <span aria-hidden>{t.emoji}</span>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="memory" className="mt-0 focus-visible:outline-none">
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="kids-card border border-border/40"
            aria-labelledby="game-memory-title"
          >
            <h2 id="game-memory-title" className="sr-only">
              Memory match game
            </h2>
            <MemoryMatchGame />
          </motion.section>
        </TabsContent>
        <TabsContent value="match" className="mt-0 focus-visible:outline-none">
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kids-card border border-border/40">
            <h2 className="sr-only">Snack matching game</h2>
            <DragMatchGame />
          </motion.section>
        </TabsContent>
        <TabsContent value="puzzle" className="mt-0 focus-visible:outline-none">
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kids-card border border-border/40">
            <h2 className="sr-only">Story puzzle</h2>
            <PicturePuzzleGame />
          </motion.section>
        </TabsContent>
        <TabsContent value="quiz" className="mt-0 focus-visible:outline-none">
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kids-card border border-border/40">
            <h2 className="sr-only">Picture quiz</h2>
            <QuizGame />
          </motion.section>
        </TabsContent>
        <TabsContent value="pattern" className="mt-0 focus-visible:outline-none">
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kids-card border border-border/40">
            <h2 className="sr-only">Pattern game</h2>
            <PatternGame />
          </motion.section>
        </TabsContent>
        <TabsContent value="spell" className="mt-0 focus-visible:outline-none">
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kids-card border border-border/40">
            <h2 className="sr-only">Spelling game</h2>
            <SpellGame />
          </motion.section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Games;
