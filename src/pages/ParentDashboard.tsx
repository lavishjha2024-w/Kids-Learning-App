import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Gamepad2, Shield, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useEffect, useMemo } from "react";
import { getLevelFromXp } from "@/lib/gamification";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { usage, settings, updateSettings, parentPinVerified } = useApp();

  useEffect(() => {
    if (!parentPinVerified) navigate("/settings");
  }, [parentPinVerified, navigate]);

  const level = getLevelFromXp(usage.xp);
  const trackedPlays = Object.values(usage.gameStats).reduce((n, s) => n + s.played, 0);
  const gamesShown = trackedPlays || usage.gamesPlayed;

  const chartData = useMemo(() => {
    return Object.entries(usage.gameStats).map(([id, s]) => ({
      name: id.replace(/-/g, " "),
      wins: s.wins,
      played: s.played,
    }));
  }, [usage.gameStats]);

  if (!parentPinVerified) return null;

  return (
    <div className="page-container max-w-4xl pb-28">
      <button
        type="button"
        onClick={() => navigate("/settings")}
        className="flex items-center gap-2 text-muted-foreground mb-6 font-semibold min-h-[44px]"
      >
        <ArrowLeft size={20} aria-hidden /> Back to settings
      </button>

      <h1 className="kids-heading text-3xl mb-2 flex flex-wrap items-center gap-2">
        <Shield size={28} aria-hidden /> Parent & teacher view
      </h1>
      <p className="text-muted-foreground font-semibold mb-8 max-w-2xl">
        Usage and growth stay on this device. Celebrate effort — KLearn never punishes mistakes.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="kids-card text-center border border-border/40">
          <Clock size={24} className="mx-auto mb-1 text-muted-foreground" aria-hidden />
          <p className="text-2xl font-black tabular-nums">{usage.totalMinutesToday}m</p>
          <p className="text-xs text-muted-foreground font-bold">Active today</p>
        </div>
        <div className="kids-card text-center border border-border/40">
          <TrendingUp size={24} className="mx-auto mb-1 text-muted-foreground" aria-hidden />
          <p className="text-2xl font-black tabular-nums">{level}</p>
          <p className="text-xs text-muted-foreground font-bold">Current level</p>
        </div>
        <div className="kids-card text-center border border-border/40">
          <BookOpen size={24} className="mx-auto mb-1 text-muted-foreground" aria-hidden />
          <p className="text-2xl font-black tabular-nums">{usage.lessonsCompleted.length}</p>
          <p className="text-xs text-muted-foreground font-bold">Topics touched</p>
        </div>
        <div className="kids-card text-center border border-border/40">
          <Gamepad2 size={24} className="mx-auto mb-1 text-muted-foreground" aria-hidden />
          <p className="text-2xl font-black tabular-nums">{gamesShown}</p>
          <p className="text-xs text-muted-foreground font-bold">Game tries logged</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="kids-card border border-border/40"
        >
          <h2 className="font-black text-lg mb-3 flex items-center gap-2">
            <Award size={20} aria-hidden /> Badges unlocked
          </h2>
          {usage.badges.length === 0 ? (
            <p className="text-sm text-muted-foreground font-semibold">No badges yet — they’ll appear as your learner explores.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {usage.badges.map((b) => (
                <Badge key={b} variant="secondary" className="rounded-xl py-1.5 px-3 text-sm font-bold">
                  {b.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4 font-semibold">
            Streak: <span className="text-foreground font-bold">{usage.streak}</span> day(s) · XP:{" "}
            <span className="text-foreground font-bold">{usage.xp}</span>
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="kids-card border border-border/40"
        >
          <h2 className="font-black text-lg mb-3">Game activity</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground font-semibold">Play a mini-game to see a chart grow here.</p>
          ) : (
            <div className="h-48 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Bar dataKey="wins" name="Wins" fill="hsl(var(--kids-mint) / 0.95)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="played" name="Played" fill="hsl(var(--kids-lavender) / 0.85)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.section>
      </div>

      <h2 className="font-black text-lg mb-3">Family controls</h2>
      <div className="space-y-3">
        <div className="kids-card border border-border/40">
          <label className="font-black block mb-2">Daily screen-time guide (minutes)</label>
          <input
            type="range"
            min={15}
            max={120}
            step={15}
            value={settings.maxScreenTime}
            onChange={(e) => updateSettings({ maxScreenTime: Number(e.target.value) })}
            className="w-full accent-primary min-h-[44px]"
          />
          <p className="text-sm text-muted-foreground mt-1 font-semibold">{settings.maxScreenTime} minutes suggested pause point</p>
        </div>

        <div className="kids-card border border-border/40">
          <label className="font-black block mb-2">Break timer length (minutes)</label>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={settings.breakDuration}
            onChange={(e) => updateSettings({ breakDuration: Number(e.target.value) })}
            className="w-full accent-primary min-h-[44px]"
          />
          <p className="text-sm text-muted-foreground mt-1 font-semibold">{settings.breakDuration} minutes calm countdown</p>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
