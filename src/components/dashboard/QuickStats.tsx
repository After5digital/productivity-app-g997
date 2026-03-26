import { useMemo } from 'react';
import { TrendingUp, Award, BarChart3 } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { getLevelFromPoints } from '../../utils/points';
import { CATEGORY_COLORS } from '../../constants';

export function QuickStats() {
  const { state } = useApp();

  const weekStats = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    const weekTasks = state.tasks.filter(t =>
      t.completed && t.completed_at &&
      t.completed_at.slice(0, 10) >= startStr &&
      t.completed_at.slice(0, 10) <= endStr
    );

    const catCounts: Record<string, number> = {};
    weekTasks.forEach(t => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });

    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      completed: weekTasks.length,
      topCategory: topCategory ? topCategory[0] : null,
      topCount: topCategory ? topCategory[1] : 0,
      catCounts,
    };
  }, [state.tasks]);

  const level = getLevelFromPoints(state.totalPoints);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Quick Stats</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-accent-gray">This Week</p>
            <p className="text-sm font-medium text-white">{weekStats.completed} tasks completed</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center">
            <Award className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-accent-gray">Level</p>
            <p className="text-sm font-medium text-white">Level {level} ({state.totalPoints} XP)</p>
          </div>
        </div>

        {weekStats.topCategory && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${CATEGORY_COLORS[weekStats.topCategory]}15` }}>
              <BarChart3 className="w-4 h-4" style={{ color: CATEGORY_COLORS[weekStats.topCategory] }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-accent-gray">Top Category</p>
              <p className="text-sm font-medium text-white">{weekStats.topCategory} ({weekStats.topCount})</p>
            </div>
          </div>
        )}

        {Object.keys(weekStats.catCounts).length > 1 && (
          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-white/[0.04]">
            {Object.entries(weekStats.catCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div
                  key={cat}
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / weekStats.completed) * 100}%`,
                    backgroundColor: CATEGORY_COLORS[cat],
                  }}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
