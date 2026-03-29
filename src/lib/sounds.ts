let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/** Short pleasant tones — no external assets. */
export function playSound(
  kind: "tap" | "success" | "hint" | "complete",
  enabled: boolean,
): void {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  switch (kind) {
    case "tap":
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.08);
      break;
    case "success":
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      break;
    case "hint":
      osc.type = "sine";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.15);
      break;
    case "complete":
      osc.type = "sine";
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.setValueAtTime(523.25, now + 0.12);
      osc.frequency.setValueAtTime(659.25, now + 0.24);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      break;
    default:
      break;
  }

  osc.start(now);
  osc.stop(now + 0.6);
}

export type SoundKind = "tap" | "success" | "hint" | "complete";
