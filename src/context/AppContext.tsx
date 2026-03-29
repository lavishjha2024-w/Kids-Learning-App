import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { updateDailyStreak } from "@/lib/gamification";

export interface UsageData {
  totalMinutesToday: number;
  sessionStart: number;
  lastActive: string;
  lessonsCompleted: string[];
  badges: string[];
  gamesPlayed: number;
  xp: number;
  points: number;
  streak: number;
  lastStreakDate: string;
  gameStats: Record<string, { played: number; wins: number }>;
}

export interface AppSettings {
  calmMode: boolean;
  breakDuration: number;
  maxScreenTime: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  fontSize: "normal" | "large" | "xlarge";
  colorblindMode: boolean;
  darkMode: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
  /** Minutes of active use before break reminder (25–30 typical). */
  breakReminderMinutes: number;
}

export interface AdaptiveState {
  mathTier: number;
  wrongStreak: number;
  rightStreak: number;
}

interface AppContextType {
  usage: UsageData;
  settings: AppSettings;
  adaptive: AdaptiveState;
  showBreakReminder: boolean;
  setShowBreakReminder: (v: boolean) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  completeLesson: (id: string) => void;
  addBadge: (badge: string) => void;
  awardXp: (amount: number) => void;
  recordStreakActivity: () => void;
  incrementGameStat: (
    gameId: string,
    won: boolean,
    opts?: { countTowardTotalGames?: boolean; skipXpReward?: boolean },
  ) => void;
  registerMathResult: (correct: boolean) => void;
  resetFocusTimer: () => void;
  parentPinVerified: boolean;
  verifyParentPin: (pin: string) => boolean;
  setParentPin: (pin: string) => void;
}

const defaultUsage: UsageData = {
  totalMinutesToday: 0,
  sessionStart: Date.now(),
  lastActive: new Date().toDateString(),
  lessonsCompleted: [],
  badges: [],
  gamesPlayed: 0,
  xp: 0,
  points: 0,
  streak: 0,
  lastStreakDate: "",
  gameStats: {},
};

const defaultSettings: AppSettings = {
  calmMode: false,
  breakDuration: 5,
  maxScreenTime: 60,
  soundEnabled: true,
  musicEnabled: false,
  fontSize: "normal",
  colorblindMode: false,
  darkMode: false,
  highContrast: false,
  dyslexiaFont: false,
  breakReminderMinutes: 25,
};

const defaultAdaptive: AdaptiveState = {
  mathTier: 1,
  wrongStreak: 0,
  rightStreak: 0,
};

function migrateUsage(parsed: Record<string, unknown>, today: string): UsageData {
  const isNewDay = parsed.lastActive !== today;
  const base: UsageData = {
    ...defaultUsage,
    lessonsCompleted: Array.isArray(parsed.lessonsCompleted) ? (parsed.lessonsCompleted as string[]) : [],
    badges: Array.isArray(parsed.badges) ? (parsed.badges as string[]) : [],
    gamesPlayed: typeof parsed.gamesPlayed === "number" ? parsed.gamesPlayed : 0,
    xp: typeof parsed.xp === "number" ? parsed.xp : 0,
    points: typeof parsed.points === "number" ? parsed.points : typeof parsed.xp === "number" ? parsed.xp : 0,
    streak: typeof parsed.streak === "number" ? parsed.streak : 0,
    lastStreakDate: typeof parsed.lastStreakDate === "string" ? parsed.lastStreakDate : "",
    gameStats:
      parsed.gameStats && typeof parsed.gameStats === "object"
        ? (parsed.gameStats as UsageData["gameStats"])
        : {},
    lastActive: isNewDay ? today : (parsed.lastActive as string),
    totalMinutesToday: isNewDay ? 0 : typeof parsed.totalMinutesToday === "number" ? parsed.totalMinutesToday : 0,
    sessionStart: Date.now(),
  };
  return base;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usage, setUsage] = useState<UsageData>(() => {
    const saved = localStorage.getItem("kids-usage");
    const today = new Date().toDateString();
    if (saved) {
      try {
        return migrateUsage(JSON.parse(saved), today);
      } catch {
        return { ...defaultUsage, lastActive: today };
      }
    }
    return { ...defaultUsage, lastActive: today };
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("kids-settings");
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [adaptive, setAdaptive] = useState<AdaptiveState>(() => {
    const saved = localStorage.getItem("kids-adaptive");
    if (saved) {
      try {
        return { ...defaultAdaptive, ...JSON.parse(saved) };
      } catch {
        return defaultAdaptive;
      }
    }
    return defaultAdaptive;
  });

  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [parentPinVerified, setParentPinVerified] = useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem("kids-parent-ok") === "1",
  );

  const focusMsRef = useRef(0);
  const breakMinutesRef = useRef(settings.breakReminderMinutes);

  useEffect(() => {
    breakMinutesRef.current = settings.breakReminderMinutes;
  }, [settings.breakReminderMinutes]);

  useEffect(() => {
    localStorage.setItem("kids-usage", JSON.stringify(usage));
  }, [usage]);

  useEffect(() => {
    localStorage.setItem("kids-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("kids-adaptive", JSON.stringify(adaptive));
  }, [adaptive]);

  /** Accumulate visible time; show break when threshold reached (visibility-of-system-status). */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (showBreakReminder) return;
      if (document.visibilityState !== "visible") return;
      focusMsRef.current += 1000;
      const threshold = breakMinutesRef.current * 60 * 1000;
      if (focusMsRef.current >= threshold) {
        focusMsRef.current = 0;
        setShowBreakReminder(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [showBreakReminder]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setUsage((prev) => {
        const next = { ...prev, totalMinutesToday: prev.totalMinutesToday + 1 };
        return next;
      });
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("calm-mode", settings.calmMode);
    document.documentElement.classList.toggle("dark", settings.darkMode);
    document.documentElement.classList.toggle("high-contrast", settings.highContrast);
    document.documentElement.classList.toggle("dyslexia-font", settings.dyslexiaFont);
  }, [settings.calmMode, settings.darkMode, settings.highContrast, settings.dyslexiaFont]);

  useEffect(() => {
    const sizes = { normal: "16px", large: "18px", xlarge: "20px" };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings.fontSize]);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  const resetFocusTimer = useCallback(() => {
    focusMsRef.current = 0;
  }, []);

  const addBadgeInternal = useCallback((prev: UsageData, badge: string): UsageData => {
    if (prev.badges.includes(badge)) return prev;
    return { ...prev, badges: [...prev.badges, badge] };
  }, []);

  const addBadge = useCallback((badge: string) => {
    setUsage((prev) => addBadgeInternal(prev, badge));
  }, [addBadgeInternal]);

  const awardXp = useCallback(
    (amount: number) => {
      setUsage((prev) => {
        let next: UsageData = {
          ...prev,
          xp: prev.xp + amount,
          points: prev.points + amount,
        };
        if (next.xp >= 500) next = addBadgeInternal(next, "xp-500");
        return next;
      });
    },
    [addBadgeInternal],
  );

  const recordStreakActivity = useCallback(() => {
    setUsage((prev) => {
      const { streak, lastStreakDate } = updateDailyStreak(
        prev.lastStreakDate || undefined,
        prev.streak,
      );
      let next: UsageData = { ...prev, streak, lastStreakDate };
      if (streak >= 3) next = addBadgeInternal(next, "streak-3");
      if (streak >= 7) next = addBadgeInternal(next, "streak-7");
      return next;
    });
  }, [addBadgeInternal]);

  const completeLesson = useCallback(
    (id: string) => {
      recordStreakActivity();
      setUsage((prev) => {
        if (prev.lessonsCompleted.includes(id)) return prev;
        const withLesson: UsageData = {
          ...prev,
          lessonsCompleted: [...prev.lessonsCompleted, id],
        };
        let next = { ...withLesson, xp: withLesson.xp + 15, points: withLesson.points + 15 };
        if (id === "math") next = addBadgeInternal(next, "math-star");
        if (next.xp >= 500) next = addBadgeInternal(next, "xp-500");
        return next;
      });
    },
    [addBadgeInternal, recordStreakActivity],
  );

  const incrementGameStat = useCallback(
    (gameId: string, won: boolean, opts?: { countTowardTotalGames?: boolean; skipXpReward?: boolean }) => {
      recordStreakActivity();
      setUsage((prev) => {
        const stats = { ...prev.gameStats };
        const cur = stats[gameId] ?? { played: 0, wins: 0 };
        stats[gameId] = {
          played: cur.played + 1,
          wins: cur.wins + (won ? 1 : 0),
        };
        let next: UsageData = {
          ...prev,
          gameStats: stats,
        };
        if (won) {
          const addXp = opts?.skipXpReward !== true;
          const bumpTotal = opts?.countTowardTotalGames !== false;
          next = {
            ...next,
            xp: addXp ? next.xp + 10 : next.xp,
            points: addXp ? next.points + 10 : next.points,
            gamesPlayed: bumpTotal ? prev.gamesPlayed + 1 : prev.gamesPlayed,
          };
        }
        if (next.xp >= 500) next = addBadgeInternal(next, "xp-500");
        return next;
      });
    },
    [addBadgeInternal, recordStreakActivity],
  );

  const registerMathResult = useCallback((correct: boolean) => {
    setAdaptive((prev) => {
      if (correct) {
        const rightStreak = prev.rightStreak + 1;
        let mathTier = prev.mathTier;
        if (rightStreak >= 5 && mathTier < 4) mathTier += 1;
        return { mathTier, rightStreak, wrongStreak: 0 };
      }
      const wrongStreak = prev.wrongStreak + 1;
      let mathTier = prev.mathTier;
      if (wrongStreak >= 3 && mathTier > 1) mathTier -= 1;
      return { mathTier, rightStreak: 0, wrongStreak };
    });
  }, []);

  const verifyParentPin = (pin: string) => {
    const stored = localStorage.getItem("kids-parent-pin") || "1234";
    const ok = pin === stored;
    if (ok) {
      sessionStorage.setItem("kids-parent-ok", "1");
      setParentPinVerified(true);
    }
    return ok;
  };

  const setParentPin = (pin: string) => {
    localStorage.setItem("kids-parent-pin", pin);
  };

  return (
    <AppContext.Provider
      value={{
        usage,
        settings,
        adaptive,
        showBreakReminder,
        setShowBreakReminder,
        updateSettings,
        completeLesson,
        addBadge,
        awardXp,
        recordStreakActivity,
        incrementGameStat,
        registerMathResult,
        resetFocusTimer,
        parentPinVerified,
        verifyParentPin,
        setParentPin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
