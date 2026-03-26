import { useMemo } from 'react';
import { Zap, Target, Flame, Crown, Trophy, Rocket, Star, Award, Crosshair } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BADGE_DEFINITIONS } from '../../constants';
import { getLevelFromPoints } from '../../utils/points';
import { getToday } from '../../utils/dates';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  target: Target,
  flame: Flame,
  crown: Crown,
  trophy: Trophy,
  rocket: Rocket,
  star: Star,
  award: Award,
  crosshair: Crosshair,
};

export function BadgeGrid() {
  const { state } = useApp();

  const stats = useMemo(() => {
    const today = getToday();
    const totalCompleted = state.tasks.filter(t => t.completed).length;
    const tasksToday = state.tasks.filter(t => t.completed && t.completed_at?.startsWith(today)).length;
    const level = getLevelFromPoints(state.totalPoints);
    const highPriorityCompleted = state.tasks.filter(t => t.completed && t.priority === 'high').length;

    const completionDates = new Set<string>();
    state.tasks.forEach(t => {
      if (t.completed && t.completed_at) completionDates.add(t.completed_at.slice(0, 10));
    });
    const sorted = [...completionDates].sort().reverse();
    let longestStreak = 0;
    if (sorted.length > 0) {
      let streak = 1;
      let maxStreak = 1;
      for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i - 1]).getTime() - new Date(sorted[i]).getTime()) / 86400000;
        if (Math.round(diff) === 1) {
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else {
          streak = 1;
        }
      }
      longestStreak = maxStreak;
    }

    return { totalCompleted, tasksToday, level, highPriorityCompleted, longestStreak };
  }, [state.tasks, state.totalPoints]);

  const badges = useMemo(() => {
    return BADGE_DEFINITIONS.map(badge => {
      const value = stats[badge.field as keyof typeof stats] as number;
      return {
        ...badge,
        unlocked: value >= badge.threshold,
        progress: Math.min(value / badge.threshold, 1),
      };
    });
  }, [stats]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Badges</h3>
        <span className="text-xs font-mono text-accent-gold">{unlockedCount}/{badges.length}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map(badge => {
          const Icon = ICON_MAP[badge.icon] || Zap;
          return (
            <div
              key={badge.id}
              className={`glass rounded-xl p-4 text-center transition-all duration-300 ${
                badge.unlocked
                  ? 'border-accent-gold/20 card-shadow'
                  : 'opacity-40 grayscale'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                badge.unlocked ? 'bg-accent-gold/15' : 'bg-white/[0.04]'
              }`}>
                <Icon className={`w-5 h-5 ${badge.unlocked ? 'text-accent-gold' : 'text-accent-gray/40'}`} />
              </div>
              <h4 className="text-xs font-medium text-white mb-0.5">{badge.name}</h4>
              <p className="text-[10px] text-accent-gray">{badge.description}</p>
              {!badge.unlocked && (
                <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-gold/40 rounded-full transition-all duration-500"
                    style={{ width: `${badge.progress * 100}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
