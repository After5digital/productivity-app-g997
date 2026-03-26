import { useMemo, useState } from 'react';
import { format, parseISO, getDay } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { getLast90Days } from '../../utils/dates';

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

function getIntensity(count: number): string {
  if (count === 0) return 'bg-white/[0.04]';
  if (count === 1) return 'bg-accent-cyan/20';
  if (count === 2) return 'bg-accent-cyan/40';
  if (count === 3) return 'bg-accent-cyan/60';
  return 'bg-accent-cyan/80';
}

export function Heatmap() {
  const { state } = useApp();
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const { grid } = useMemo(() => {
    const days = getLast90Days();
    const countMap: Record<string, number> = {};

    state.tasks.forEach(t => {
      if (t.completed && t.completed_at) {
        const d = t.completed_at.slice(0, 10);
        countMap[d] = (countMap[d] || 0) + 1;
      }
    });

    const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
    let currentWeek: { date: string; count: number; dayOfWeek: number }[] = [];

    days.forEach(d => {
      const dayOfWeek = (getDay(parseISO(d)) + 6) % 7;
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push({ date: d, count: countMap[d] || 0, dayOfWeek });
    });

    if (currentWeek.length > 0) weeks.push(currentWeek);

    return { grid: weeks };
  }, [state.tasks]);

  return (
    <div className="glass rounded-xl p-5 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Activity</h3>
        <span className="text-xs text-accent-gray font-mono">Last 90 days</span>
      </div>

      <div className="flex gap-0.5 overflow-x-auto pb-2">
        <div className="flex flex-col gap-0.5 mr-1.5 shrink-0">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[13px] flex items-center">
              <span className="text-[9px] text-accent-gray/60 w-6 text-right">{label}</span>
            </div>
          ))}
        </div>

        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {Array.from({ length: 7 }, (_, di) => {
              const day = week.find(d => d.dayOfWeek === di);
              if (!day) {
                return <div key={di} className="w-[13px] h-[13px]" />;
              }
              return (
                <div
                  key={di}
                  className={`w-[13px] h-[13px] rounded-[2px] heatmap-cell cursor-pointer ${getIntensity(day.count)}`}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top - 40 });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[9px] text-accent-gray/60">Less</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${getIntensity(i)}`} />
        ))}
        <span className="text-[9px] text-accent-gray/60">More</span>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 glass rounded-lg px-3 py-1.5 text-xs pointer-events-none card-shadow"
          style={{ left: tooltip.x - 20, top: tooltip.y }}
        >
          <span className="text-white font-medium">{tooltip.count} task{tooltip.count !== 1 ? 's' : ''}</span>
          <span className="text-accent-gray ml-1.5">{format(parseISO(tooltip.date), 'MMM d')}</span>
        </div>
      )}
    </div>
  );
}
