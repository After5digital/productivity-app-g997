import { useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarDays, Flame, Target, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOTIVATIONAL_QUOTES } from '../../constants';
import { getToday, isOverdue, isDueToday } from '../../utils/dates';

export function DailySummary() {
  const { state } = useApp();

  const quote = useMemo(() => {
    const idx = Math.floor(Date.now() / 86400000) % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[idx];
  }, []);

  const today = getToday();
  const todayTasks = state.tasks.filter(t => !t.completed && (isDueToday(t.due_date) || isOverdue(t.due_date)));
  const completedToday = state.tasks.filter(t => t.completed && t.completed_at?.startsWith(today)).length;

  const currentStreak = useMemo(() => {
    const completionDates = new Set<string>();
    state.tasks.forEach(t => {
      if (t.completed && t.completed_at) {
        completionDates.add(t.completed_at.slice(0, 10));
      }
    });
    const sorted = [...completionDates].sort().reverse();
    if (sorted.length === 0) return 0;

    const todayStr = getToday();
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    if (sorted[0] !== todayStr && sorted[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i - 1]).getTime() - new Date(sorted[i]).getTime()) / 86400000;
      if (Math.round(diff) === 1) streak++;
      else break;
    }
    return streak;
  }, [state.tasks]);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-accent-gray text-sm mb-1">{format(new Date(), 'EEEE, MMMM d')}</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-accent-gray/70 text-sm mt-1 italic">{quote}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass rounded-xl p-4 glass-hover transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent-cyan" />
            <span className="text-xs text-accent-gray">Due Today</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{todayTasks.length}</p>
        </div>

        <div className="glass rounded-xl p-4 glass-hover transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-accent-green" />
            <span className="text-xs text-accent-gray">Done Today</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{completedToday}</p>
        </div>

        <div className="glass rounded-xl p-4 glass-hover transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-accent-orange" />
            <span className="text-xs text-accent-gray">Streak</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {currentStreak}
            <span className="text-sm text-accent-gray ml-1">days</span>
          </p>
        </div>

        <div className="glass rounded-xl p-4 glass-hover transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-accent-gold" />
            <span className="text-xs text-accent-gray">All-Time</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {state.tasks.filter(t => t.completed).length}
          </p>
        </div>
      </div>
    </div>
  );
}
