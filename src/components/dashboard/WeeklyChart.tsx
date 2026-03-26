import { useMemo } from 'react';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { getWeekDays } from '../../utils/dates';
import { CATEGORY_COLORS } from '../../constants';
export function WeeklyChart() {
  const { state } = useApp();

  const weekData = useMemo(() => {
    const days = getWeekDays();
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = state.tasks.filter(t =>
        t.completed && t.completed_at?.startsWith(dateStr)
      );
      const total = dayTasks.length;
      const byCategory: Record<string, number> = {};
      dayTasks.forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + 1;
      });
      return { day, dateStr, label: format(day, 'EEE'), total, byCategory };
    });
  }, [state.tasks]);

  const maxTasks = useMemo(() => Math.max(...weekData.map(d => d.total), 1), [weekData]);
  const totalWeek = weekData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">This Week</h3>
        <span className="text-xs font-mono text-accent-green">{totalWeek} completed</span>
      </div>

      <div className="flex items-end gap-2 h-32">
        {weekData.map(({ label, total, byCategory, dateStr }) => {
          const height = (total / maxTasks) * 100;
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
          const categories = Object.entries(byCategory);

          return (
            <div key={dateStr} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative flex flex-col justify-end h-24">
                {total > 0 ? (
                  <div
                    className="w-full rounded-t-md overflow-hidden transition-all duration-700 ease-out"
                    style={{ height: `${height}%`, minHeight: 4 }}
                  >
                    {categories.length > 0 && categories.map(([cat, count], i) => (
                      <div
                        key={cat}
                        className="w-full"
                        style={{
                          height: `${(count / total) * 100}%`,
                          backgroundColor: CATEGORY_COLORS[cat],
                          opacity: 0.7 + (i * 0.1),
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-1 rounded bg-white/[0.04]" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isToday ? 'text-accent-cyan' : 'text-accent-gray/60'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
