export interface BadgeMeta {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export const BADGE_CATALOG: BadgeMeta[] = [
  { id: "alphabets-master", label: "ABC Explorer", emoji: "🔤", description: "Finished the alphabet journey!" },
  { id: "numbers-master", label: "Number Buddy", emoji: "🔢", description: "Learned 0–9!" },
  { id: "shapes-master", label: "Shape Artist", emoji: "🎨", description: "Met every shape!" },
  { id: "colors-master", label: "Color Whiz", emoji: "🌈", description: "Sorted all the colors!" },
  { id: "math-star", label: "Math Star", emoji: "⭐", description: "Completed the math explorer path!" },
  { id: "memory-champion", label: "Memory Hero", emoji: "🧠", description: "Won the memory match game!" },
  { id: "match-maker", label: "Match Maker", emoji: "🧩", description: "Matched pairs like a pro!" },
  { id: "puzzle-master", label: "Puzzle Master", emoji: "🖼️", description: "Completed picture puzzles!" },
  { id: "quiz-hero", label: "Quiz Hero", emoji: "🏆", description: "Nailed the quiz game!" },
  { id: "pattern-pro", label: "Pattern Pro", emoji: "🔁", description: "Spotted tricky patterns!" },
  { id: "word-wizard", label: "Word Wizard", emoji: "✨", description: "Spelled like a wizard!" },
  { id: "streak-3", label: "3-Day Spark", emoji: "🔥", description: "Learned 3 days in a row!" },
  { id: "streak-7", label: "7-Day Glow", emoji: "🌟", description: "A whole week of learning!" },
  { id: "xp-500", label: "Super Learner", emoji: "🚀", description: "Earned 500 XP!" },
];

export function badgeMeta(id: string): BadgeMeta | undefined {
  return BADGE_CATALOG.find((b) => b.id === id);
}
