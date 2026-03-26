export const DEFAULT_CATEGORIES = ['Personal', 'After5', 'ApexAI', 'Habits', 'Reading', 'Other'] as const;

const CATEGORY_COLOR_MAP: Record<string, string> = {
  After5: '#00d9ff',
  ApexAI: '#9d00ff',
  Personal: '#ff6b35',
  Habits: '#00ff88',
  Reading: '#ffd700',
  Other: '#8899aa',
};

const CUSTOM_CATEGORY_PALETTE = [
  '#f472b6', '#fb923c', '#a3e635', '#22d3ee',
  '#818cf8', '#e879f9', '#34d399', '#fbbf24',
];

export function getCategoryColor(category: string): string {
  if (CATEGORY_COLOR_MAP[category]) return CATEGORY_COLOR_MAP[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CUSTOM_CATEGORY_PALETTE[Math.abs(hash) % CUSTOM_CATEGORY_PALETTE.length];
}

export const CATEGORY_COLORS = new Proxy(CATEGORY_COLOR_MAP, {
  get(target, prop: string) {
    return target[prop] || getCategoryColor(prop);
  },
}) as Record<string, string>;

export const PRIORITY_COLORS = {
  high: '#ff4444',
  medium: '#ffa500',
  low: '#00ff88',
} as const;

export const TIME_ESTIMATES = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
  { label: '4h+', value: 240 },
];

export const POINTS_PER_TASK = 10;
export const HIGH_PRIORITY_MULTIPLIER = 1.5;
export const STREAK_MULTIPLIER = 2;
export const ALL_HABITS_BONUS = 50;
export const BEAT_ESTIMATE_BONUS = 5;
export const POINTS_PER_LEVEL = 500;

export const MOTIVATIONAL_QUOTES = [
  "Ship it or regret it.",
  "Small steps compound into huge leaps.",
  "Discipline beats motivation every day.",
  "Build something worth using.",
  "The streak doesn't maintain itself.",
  "Action eliminates anxiety.",
  "Focus mode: activated.",
  "One task at a time, one day at a time.",
  "Your future self will thank you.",
  "Consistency is the ultimate superpower.",
  "Stop planning, start doing.",
  "Every task completed is a brick in the foundation.",
  "You're closer than you think.",
  "Progress over perfection.",
  "The grind is the glory.",
];

export const DEFAULT_HABITS = [
  { name: 'Gym', icon: 'dumbbell', color: '#00ff88' },
  { name: 'Running', icon: 'footprints', color: '#00d9ff' },
  { name: 'Reading', icon: 'book-open', color: '#ffd700' },
  { name: 'Eating Healthy', icon: 'apple', color: '#ff6b35' },
  { name: 'Sleep 8h+', icon: 'moon', color: '#9d00ff' },
  { name: 'Cold Shower', icon: 'snowflake', color: '#00d9ff' },
];

export const BADGE_DEFINITIONS = [
  { id: 'first_task', name: 'First Blood', description: 'Complete your first task', icon: 'zap', threshold: 1, field: 'totalCompleted' as const },
  { id: 'ten_tasks', name: 'Getting Started', description: 'Complete 10 tasks', icon: 'target', threshold: 10, field: 'totalCompleted' as const },
  { id: 'fifty_tasks', name: 'Grinder', description: 'Complete 50 tasks', icon: 'flame', threshold: 50, field: 'totalCompleted' as const },
  { id: 'hundred_tasks', name: 'Centurion', description: 'Complete 100 tasks', icon: 'crown', threshold: 100, field: 'totalCompleted' as const },
  { id: 'streak_7', name: 'On Fire', description: '7-day streak', icon: 'flame', threshold: 7, field: 'longestStreak' as const },
  { id: 'streak_14', name: 'Relentless', description: '14-day streak', icon: 'flame', threshold: 14, field: 'longestStreak' as const },
  { id: 'streak_30', name: 'Unstoppable', description: '30-day streak', icon: 'flame', threshold: 30, field: 'longestStreak' as const },
  { id: 'streak_90', name: 'Legendary', description: '90-day streak', icon: 'trophy', threshold: 90, field: 'longestStreak' as const },
  { id: 'speed_racer', name: 'Speed Racer', description: '5 tasks in one day', icon: 'rocket', threshold: 5, field: 'tasksToday' as const },
  { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: 'star', threshold: 5, field: 'level' as const },
  { id: 'level_10', name: 'Veteran', description: 'Reach Level 10', icon: 'award', threshold: 10, field: 'level' as const },
  { id: 'focused', name: 'Focused', description: 'Complete a high-priority task', icon: 'crosshair', threshold: 1, field: 'highPriorityCompleted' as const },
];
