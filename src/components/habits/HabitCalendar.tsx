import { useMemo } from 'react';
import { format } from 'date-fns';
import { getMonthDays, getToday } from '../../utils/dates';
import type { Habit } from '../../types';

interface HabitCalendarProps {
  habit: Habit;
}

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function HabitCalendar({ habit }: HabitCalendarProps) {
  const today = getToday();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const completedSet = useMemo(() => new Set(habit.completed_dates), [habit.completed_dates]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const completedThisMonth = habit.completed_dates.filter(d => {
    return d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);
  }).length;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-medium text-white">{habit.name}</h4>
          <p className="text-xs text-accent-gray mt-0.5">{format(now, 'MMMM yyyy')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono text-accent-green">{completedThisMonth}/{daysInMonth}</p>
          <p className="text-[10px] text-accent-gray">days this month</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-accent-gray/50 py-1">{d}</div>
        ))}
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const done = completedSet.has(day);
          const isToday = day === today;
          return (
            <div
              key={day}
              className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-mono transition-all ${
                done
                  ? 'bg-accent-green/30 text-accent-green'
                  : isToday
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                  : 'text-accent-gray/40'
              }`}
            >
              {parseInt(day.split('-')[2])}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
        <div>
          <span className="text-[10px] text-accent-gray">Current streak</span>
          <p className="text-sm font-mono text-accent-orange">{habit.streak} days</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-accent-gray">Best streak</span>
          <p className="text-sm font-mono text-accent-gold">{habit.best_streak} days</p>
        </div>
      </div>
    </div>
  );
}
