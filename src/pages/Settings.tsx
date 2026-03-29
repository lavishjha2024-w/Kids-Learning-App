import { useState, type ElementType } from "react";
import { motion } from "framer-motion";
import { Moon, Volume2, Eye, Type, Lock, Shield, Sun, Contrast, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { settings, updateSettings, parentPinVerified, verifyParentPin } = useApp();
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const navigate = useNavigate();

  const handlePinSubmit = () => {
    if (verifyParentPin(pinInput)) {
      setPinError(false);
    } else {
      setPinError(true);
    }
    setPinInput("");
  };

  const Toggle = ({
    enabled,
    onToggle,
    label,
    desc,
    icon: Icon,
  }: {
    enabled: boolean;
    onToggle: () => void;
    label: string;
    desc?: string;
    icon: ElementType;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="kids-card flex items-center justify-between w-full text-left border border-border/50"
      role="switch"
      aria-checked={enabled}
    >
      <div className="flex items-center gap-3 pr-2">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${enabled ? "bg-kids-mint" : "bg-muted"}`}>
          <Icon size={22} aria-hidden />
        </div>
        <div>
          <span className="font-black block">{label}</span>
          {desc && <span className="text-xs text-muted-foreground font-semibold">{desc}</span>}
        </div>
      </div>
      <div className={`w-12 h-7 rounded-full transition-colors shrink-0 ${enabled ? "bg-primary" : "bg-muted"} relative`}>
        <motion.div
          animate={{ x: enabled ? 22 : 2 }}
          className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-soft"
        />
      </div>
    </button>
  );

  return (
    <div className="page-container max-w-xl">
      <h1 className="kids-heading text-3xl mb-2">Comfort & care</h1>
      <p className="text-muted-foreground font-semibold mb-8">
        Make KLearn feel just right for your eyes, ears, and pace.
      </p>

      <div className="space-y-3 mb-8">
        <Toggle
          enabled={settings.darkMode}
          onToggle={() => updateSettings({ darkMode: !settings.darkMode })}
          label="Evening cozy mode"
          desc="Gentle dark colors for low light"
          icon={Moon}
        />
        <Toggle
          enabled={settings.calmMode}
          onToggle={() => updateSettings({ calmMode: !settings.calmMode })}
          label="Calm palette"
          desc="Softer colors all day"
          icon={Sun}
        />
        <Toggle
          enabled={settings.highContrast}
          onToggle={() => updateSettings({ highContrast: !settings.highContrast })}
          label="Clearer contrast"
          desc="Easier to read text and edges"
          icon={Contrast}
        />
        <Toggle
          enabled={settings.soundEnabled}
          onToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          label="Sounds & spoken hints"
          icon={Volume2}
        />
        <Toggle
          enabled={settings.colorblindMode}
          onToggle={() => updateSettings({ colorblindMode: !settings.colorblindMode })}
          label="Color-safe shapes"
          desc="Extra cues besides color alone"
          icon={Eye}
        />
        <Toggle
          enabled={settings.dyslexiaFont}
          onToggle={() => updateSettings({ dyslexiaFont: !settings.dyslexiaFont })}
          label="Reading-friendly letters"
          desc="Uses the Lexend font style"
          icon={BookOpen}
        />
      </div>

      <div className="kids-card mb-6 border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <Type size={22} aria-hidden />
          <div>
            <span className="font-black block">Text size</span>
            <span className="text-xs text-muted-foreground font-semibold">Bigger taps, bigger smiles</span>
          </div>
        </div>
        <div className="flex gap-2">
          {(["normal", "large", "xlarge"] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateSettings({ fontSize: size })}
              className={`kids-btn flex-1 text-sm min-h-[52px] ${
                settings.fontSize === size ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
            </button>
          ))}
        </div>
      </div>

      <div className="kids-card mb-10 border border-border/50">
        <label className="font-black block mb-1">Break reminder timing</label>
        <p className="text-xs text-muted-foreground font-semibold mb-3">
          After this many minutes of play, we’ll invite a soft break.
        </p>
        <input
          type="range"
          min={20}
          max={30}
          step={1}
          value={settings.breakReminderMinutes}
          onChange={(e) => updateSettings({ breakReminderMinutes: Number(e.target.value) })}
          className="w-full accent-primary min-h-[44px]"
          aria-valuemin={20}
          aria-valuemax={30}
          aria-valuenow={settings.breakReminderMinutes}
        />
        <p className="text-sm font-bold text-foreground mt-1 tabular-nums">{settings.breakReminderMinutes} minutes</p>
      </div>

      <div className="kids-card border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <Shield size={22} aria-hidden />
          <span className="font-black">Grown-up summary</span>
        </div>

        {parentPinVerified ? (
          <button type="button" onClick={() => navigate("/parent")} className="kids-btn-peach w-full min-h-[52px]">
            <Lock size={18} aria-hidden /> Open parent dashboard
          </button>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-3">PIN (default 1234)</p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="password"
                maxLength={4}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="flex-1 min-w-[120px] rounded-2xl border border-border px-4 py-3 text-center text-lg font-black tracking-widest bg-muted focus:outline-none focus:ring-4 focus:ring-ring/40 min-h-[52px]"
              />
              <button type="button" onClick={handlePinSubmit} className="kids-btn-primary !px-8 min-h-[52px]">
                Go
              </button>
            </div>
            {pinError && (
              <p className="text-sm mt-3 font-bold text-foreground bg-kids-peach/40 rounded-xl py-2 px-3">
                That PIN doesn’t match — give it another try when you’re ready.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
