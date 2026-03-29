import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Gamepad2, BarChart3, Sparkles, Flame, Star } from "lucide-react";
import mascot from "@/assets/mascot.png";
import heroBg from "@/assets/hero-bg.jpg";
import MoodCheck from "@/components/MoodCheck";
import { useApp } from "@/context/AppContext";
import { getLevelFromXp } from "@/lib/gamification";

const features = [
  { icon: BookOpen, label: "Learn", desc: "Letters, math & colors", path: "/learn", color: "bg-kids-blue" },
  { icon: Gamepad2, label: "Play", desc: "Six mini worlds", path: "/games", color: "bg-kids-mint" },
  { icon: BarChart3, label: "Progress", desc: "Levels & badges", path: "/progress", color: "bg-kids-lavender" },
];

const Index = () => {
  const navigate = useNavigate();
  const { usage } = useApp();
  const level = getLevelFromXp(usage.xp);

  const [moodDone, setMoodDone] = useState(() => {
    const last = localStorage.getItem("kids-mood-date");
    return last === new Date().toDateString();
  });

  const handleMoodComplete = () => {
    localStorage.setItem("kids-mood-date", new Date().toDateString());
    setMoodDone(true);
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative rounded-[2rem] overflow-hidden mb-8 border border-border/50 shadow-soft"
      >
        <img src={heroBg} alt="" className="w-full h-52 sm:h-64 object-cover opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pt-6 px-4 text-center">
          <motion.img
            src={mascot}
            alt="Owly the learning owl"
            width={112}
            height={112}
            className="mx-auto mb-2 drop-shadow-md"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <h1 className="kids-heading text-3xl sm:text-5xl text-foreground drop-shadow-sm">
            Hi, friend! <Sparkles className="inline w-7 h-7 text-kids-yellow" aria-hidden />
          </h1>
          <p className="text-muted-foreground font-bold mt-2 max-w-md text-balance">
            KLearn is your cozy corner for tiny wins and big curiosity.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-3 mt-6"
          >
            <div className="flex items-center gap-2 rounded-2xl bg-card/90 backdrop-blur px-4 py-2 border border-border/50 shadow-soft">
              <Star className="text-kids-yellow fill-kids-yellow" size={20} aria-hidden />
              <span className="font-black text-sm">Level {level}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-card/90 backdrop-blur px-4 py-2 border border-border/50 shadow-soft">
              <Flame className="text-orange-500" size={20} aria-hidden />
              <span className="font-black text-sm">{usage.streak} day streak</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {!moodDone && (
        <div className="mb-8">
          <MoodCheck onComplete={handleMoodComplete} />
        </div>
      )}

      <h2 className="sr-only">Where do you want to go?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {features.map((f, i) => (
          <motion.button
            key={f.label}
            type="button"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.07 }}
            onClick={() => navigate(f.path)}
            className="kids-card-interactive text-left border border-border/50"
          >
            <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-3 shadow-soft`}>
              <f.icon size={28} className="text-foreground" aria-hidden />
            </div>
            <h3 className="font-black text-xl">{f.label}</h3>
            <p className="text-sm text-muted-foreground font-semibold">{f.desc}</p>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="kids-card bg-kids-mint/25 text-center border border-border/40"
      >
        <p className="font-bold text-lg">Tiny sips of water help your brain sparkle.</p>
        <p className="text-sm text-muted-foreground font-semibold mt-1">You choose the pace — we’re proud of you.</p>
      </motion.div>
    </div>
  );
};

export default Index;
