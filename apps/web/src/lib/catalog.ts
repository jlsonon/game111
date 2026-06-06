import type { AchievementDefinition, GameDefinition, GameType, ProgressionResult, TitleDefinition } from "@partyverse/shared";

export const games: GameDefinition[] = [
  {
    type: "DRAW_GUESS",
    name: "Draw & Guess",
    tagline: "Sketch fast, guess faster, replay every chaotic masterpiece.",
    minPlayers: 2,
    maxPlayers: 12,
    averageMinutes: 12,
    primarySkill: "Creativity",
    phases: ["WORD_SELECT", "DRAWING", "GUESSING", "REVEAL"],
    features: ["Realtime canvas", "Brushes", "Eraser", "Undo", "Guess chat", "Replay mode"],
  },
  {
    type: "BLUFF_MASTER",
    name: "Bluff Master",
    tagline: "Submit convincing lies and steal points from confident friends.",
    minPlayers: 3,
    maxPlayers: 10,
    averageMinutes: 15,
    primarySkill: "Deception",
    phases: ["SUBMITTING", "VOTING", "REVEAL"],
    features: ["Fake answers", "Correct answer shuffle", "Fooling bonuses", "Round scoring"],
  },
  {
    type: "MEME_BATTLE",
    name: "Meme Battle",
    tagline: "Pick a template, write the caption, survive the vote.",
    minPlayers: 3,
    maxPlayers: 12,
    averageMinutes: 10,
    primarySkill: "Humor",
    phases: ["SUBMITTING", "VOTING", "REVEAL"],
    features: ["Prompt generator", "Caption editor", "Templates", "Winner showcase"],
  },
  {
    type: "TRIVIA_SHOWDOWN",
    name: "Trivia Showdown",
    tagline: "General knowledge, movies, anime, gaming, science, history, and Philippines.",
    minPlayers: 1,
    maxPlayers: 20,
    averageMinutes: 8,
    primarySkill: "Knowledge",
    phases: ["SUBMITTING", "REVEAL"],
    features: ["Multiple choice", "True/false", "Speed round", "Category ladders"],
  },
  {
    type: "SECRET_SPY",
    name: "Secret Spy",
    tagline: "Everyone knows the location except the spy hiding in plain sight.",
    minPlayers: 4,
    maxPlayers: 12,
    averageMinutes: 14,
    primarySkill: "Deduction",
    phases: ["DAY", "VOTING", "SPY_GUESS", "REVEAL"],
    features: ["Hidden spy", "Random locations", "Question rounds", "Spy guess"],
  },
  {
    type: "MAFIA",
    name: "Mafia",
    tagline: "Night actions, day debates, and automated social deduction.",
    minPlayers: 6,
    maxPlayers: 16,
    averageMinutes: 20,
    primarySkill: "Strategy",
    phases: ["NIGHT", "DAY", "VOTING", "REVEAL"],
    features: ["Mafia", "Detective", "Doctor", "Citizen", "Automated cycles"],
  },
  {
    type: "TELEPHONE_DRAWING",
    name: "Telephone Drawing",
    tagline: "Draw, guess, redraw, then reveal the collapse of context.",
    minPlayers: 4,
    maxPlayers: 14,
    averageMinutes: 18,
    primarySkill: "Interpretation",
    phases: ["DRAWING", "GUESSING", "REVEAL"],
    features: ["Draw/guess chain", "Reveal sequence", "Saved albums"],
  },
  {
    type: "MOST_LIKELY_TO",
    name: "Most Likely To",
    tagline: "Anonymous votes, instant results, and surprisingly accurate friend stats.",
    minPlayers: 3,
    maxPlayers: 20,
    averageMinutes: 7,
    primarySkill: "Social",
    phases: ["VOTING", "REVEAL"],
    features: ["Prompt deck", "Anonymous voting", "Live results", "Funny statistics"],
  },
  {
    type: "WOULD_YOU_RATHER",
    name: "Would You Rather",
    tagline: "Impossible choices with live percentages and friend comparisons.",
    minPlayers: 2,
    maxPlayers: 30,
    averageMinutes: 6,
    primarySkill: "Preference",
    phases: ["VOTING", "REVEAL"],
    features: ["Question library", "Live percentages", "Friend comparisons"],
  },
  {
    type: "FASTEST_FINGER",
    name: "Fastest Finger",
    tagline: "Speed quizzes, buzz-ins, reaction timing, and streak multipliers.",
    minPlayers: 2,
    maxPlayers: 24,
    averageMinutes: 6,
    primarySkill: "Speed",
    phases: ["SUBMITTING", "REVEAL"],
    features: ["Buzz-in", "Reaction timing", "Speed scoring", "Bonus streaks"],
  },
];

export const gameByType = Object.fromEntries(games.map((game) => [game.type, game])) as Record<GameType, GameDefinition>;

const achievementCategories: AchievementDefinition["category"][] = [
  "Drawing",
  "Trivia",
  "Social",
  "Mafia",
  "Spy",
  "Meme",
  "General",
  "Bluff",
  "Speed",
];

const milestones = [
  ["FIRST", "First Spark", "Complete your first party round", "Bronze", 100, 50],
  ["WIN_1", "First Win", "Win your first match", "Bronze", 150, 75],
  ["WIN_10", "10 Wins", "Win 10 matches", "Silver", 500, 250],
  ["WIN_100", "100 Wins", "Win 100 matches", "Epic", 3000, 1500],
  ["STREAK_5", "Hot Streak", "Keep a 5 game streak", "Gold", 900, 400],
  ["PERFECT", "Perfect Round", "Score every prompt in a round", "Legendary", 5000, 2500],
] as const;

const coreAchievements: AchievementDefinition[] = achievementCategories.flatMap((category, categoryIndex) =>
  milestones.map(([suffix, name, description, tier, xpReward, coinReward], milestoneIndex) => ({
    id: `${category.toUpperCase()}_${suffix}`,
    name: category === "General" ? name : `${category} ${name}`,
    description,
    category,
    tier,
    xpReward: xpReward + categoryIndex * 25 + milestoneIndex * 10,
    coinReward: coinReward + categoryIndex * 10,
  })),
);

const seasonalAchievements: AchievementDefinition[] = Array.from({ length: 55 }, (_, index) => ({
  id: `SEASONAL_CHALLENGE_${index + 1}`,
  name: `Seasonal Challenge ${index + 1}`,
  description: `Complete rotating party objective ${index + 1}.`,
  category: "General",
  tier: index % 10 === 0 ? "Legendary" : index % 4 === 0 ? "Epic" : index % 3 === 0 ? "Gold" : "Silver",
  xpReward: 250 + index * 35,
  coinReward: 125 + index * 15,
}));

export const achievements: AchievementDefinition[] = [...coreAchievements, ...seasonalAchievements];

export const titles: TitleDefinition[] = [
  { id: "drawing-god", name: "Drawing God", condition: "Win 25 Draw & Guess rounds", rarity: "Legendary" },
  { id: "master-liar", name: "Master Liar", condition: "Fool 100 voters", rarity: "Epic" },
  { id: "trivia-king", name: "Trivia King", condition: "Reach 90% trivia accuracy", rarity: "Legendary" },
  { id: "spy-hunter", name: "Spy Hunter", condition: "Catch 20 spies", rarity: "Epic" },
  { id: "mafia-boss", name: "Mafia Boss", condition: "Win 15 mafia games as mafia", rarity: "Legendary" },
  { id: "quick-thinker", name: "Quick Thinker", condition: "Win 50 fastest finger buzz-ins", rarity: "Rare" },
  { id: "meme-lord", name: "Meme Lord", condition: "Win 30 meme battles", rarity: "Epic" },
  { id: "social-butterfly", name: "Social Butterfly", condition: "Play with 50 unique players", rarity: "Rare" },
  { id: "legend", name: "Legend", condition: "Reach level 100", rarity: "Legendary" },
  { id: "grandmaster", name: "Grandmaster", condition: "Reach top 1% all-time leaderboard", rarity: "Legendary" },
];

export const prompts = {
  drawing: ["Jeepney on Mars", "Karaoke champion", "A dragon eating halo-halo", "Robot at a birthday party"],
  bluff: ["The first vending machine dispensed what?", "A group of flamingos is called a what?", "What food was once used as currency?"],
  meme: ["When the squad says one more game", "POV: You are the spy", "The host changes timer to 10 seconds"],
  wouldYouRather: ["Always know the trivia answer or always draw perfectly?", "Win coins daily or unlock every title?", "Be the spy every round or mafia every round?"],
  mostLikely: ["Most likely to overthink a simple prompt?", "Most likely to vote for their own meme?", "Most likely to carry trivia night?"],
};

export function calculateProgression(xp: number): ProgressionResult {
  let level = 1;
  let remaining = Math.max(0, xp);
  let needed = xpForLevel(level);

  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpForLevel(level);
  }

  return {
    xp,
    level,
    xpForCurrentLevel: remaining,
    xpForNextLevel: needed,
    progress: Math.round((remaining / needed) * 100),
  };
}

export function xpForLevel(level: number) {
  return Math.floor(120 * Math.pow(level, 1.42) + level * 80);
}

export function calculateMatchRewards(options: { placement: number; players: number; participated: boolean; votes: number; streak: number }) {
  const placementBonus = Math.max(0, options.players - options.placement + 1) * 35;
  const participation = options.participated ? 120 : 0;
  const voteBonus = options.votes * 12;
  const streakBonus = Math.min(options.streak, 10) * 25;
  const xp = participation + placementBonus + voteBonus + streakBonus;
  return { xp, coins: Math.max(20, Math.round(xp * 0.38)) };
}

export const leaderboardEntries = [
  { name: "Mika", title: "Trivia King", xp: 248900, wins: 812, coins: 48020 },
  { name: "Jolo", title: "Master Liar", xp: 221440, wins: 760, coins: 42100 },
  { name: "Sam", title: "Drawing God", xp: 198320, wins: 690, coins: 38810 },
  { name: "Ari", title: "Spy Hunter", xp: 177910, wins: 603, coins: 34440 },
  { name: "Luna", title: "Meme Lord", xp: 151250, wins: 510, coins: 29100 },
];

export const galleryMoments = [
  { title: "Jeepney on Mars", game: "Draw & Guess", stat: "98% guessed wrong", color: "from-fuchsia-500 to-amber-300" },
  { title: "The suspicious pineapple", game: "Secret Spy", stat: "Spy won in 42s", color: "from-emerald-400 to-sky-500" },
  { title: "One more game", game: "Meme Battle", stat: "12 vote sweep", color: "from-rose-500 to-violet-500" },
  { title: "0.18 second buzz", game: "Fastest Finger", stat: "Weekly record", color: "from-cyan-400 to-lime-300" },
];
