import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  BookOpen,
  Gamepad2,
  Award,
  Flame,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { BADGE_CATALOG } from "@/lib/badges";
import { getLevelFromXp, getLevelProgressPercent, XP_PER_LEVEL } from "@/lib/gamification";
import { Progress as UiProgress } from "@/components/ui/progress";

const ProgressPage = () => {
  const { usage } = useApp();
  const level = getLevelFromXp(usage.xp);
  const xpInLevel = usage.xp % XP_PER_LEVEL;
  const trackedPlays = Object.values(usage.gameStats).reduce((n, s) => n + s.played, 0);
  const gamesLabel = trackedPlays || usage.gamesPlayed;

  const stats = [
    { icon: Clock, label: "Time today", value: `${usage.totalMinutesToday} min`, color: "bg-kids-blue" },
    { icon: BookOpen, label: "Topics explored", value: usage.lessonsCompleted.length, color: "bg-kids-mint" },
    { icon: Gamepad2, label: "Game tries", value: gamesLabel, color: "bg-kids-lavender" },
    { icon: Trophy, label: "Badges", value: usage.badges.length, color: "bg-kids-peach" },
  ];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="kids-heading text-3xl sm:text-4xl mb-2">Your adventure board</h1>
        <p className="text-muted-foreground font-semibold">
          Every star here is something you practiced — big or small, it counts.
        </p>
      </motion.div>

      {/* Level / XP */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="kids-card mb-8 bg-gradient-to-br from-primary/25 via-card to-secondary/20 border border-border/60"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Sparkles size={14} aria-hidden /> Level {level}
            </p>
            <p className="kids-heading text-2xl">Keep your glow going!</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-kids-yellow/35 px-4 py-2 font-black text-lg">
            <Flame className="text-orange-500" size={22} aria-hidden />
            {usage.streak} day{usage.streak === 1 ? "" : "s"}
          </div>
        </div>
        <div className="mb-2 flex justify-between text-sm font-bold text-muted-foreground">
          <span>Experience</span>
          <span className="tabular-nums">
            {xpInLevel} / {XP_PER_LEVEL} XP
          </span>
        </div>
        <UiProgress value={getLevelProgressPercent(usage.xp)} className="h-4 rounded-full" />
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          Star points: <span className="text-foreground font-black">{usage.points}</span>
        </p>
      </motion.section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05 }}
            className="kids-card text-center border border-border/40"
          >
            <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-soft`}>
              <s.icon size={24} className="text-foreground" />
            </div>
            <p className="text-3xl font-black tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground font-bold">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <h2 className="kids-heading text-xl mb-4 flex items-center gap-2">
        <Award size={22} aria-hidden /> Badge shelf
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {BADGE_CATALOG.map((badge) => {
          const earned = usage.badges.includes(badge.id);
          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -3 }}
              className={`kids-card text-center border transition-all ${
                earned ? "border-kids-mint shadow-soft" : "border-border/30 opacity-45 grayscale"
              }`}
            >
              <span className="text-4xl block mb-2" aria-hidden>
                {badge.emoji}
              </span>
              <p className="text-sm font-black leading-tight">{badge.label}</p>
              <p className="text-xs text-muted-foreground mt-1 font-semibold line-clamp-2">{badge.description}</p>
              {earned && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-kids-mint">
                  <Trophy size={12} aria-hidden /> Unlocked
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="kids-card bg-kids-mint/25 text-center mt-10 border border-border/40"
      >
        <p className="font-black text-lg">You’re building real skills here.</p>
        <p className="text-sm text-muted-foreground font-semibold">No “fails” — only “let’s try again” moments.</p>
      </motion.div>
    </div>
  );
};

export default ProgressPage;
