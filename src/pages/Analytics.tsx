import { useMemo } from 'react';
import { format, subDays, parseISO, getDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { BadgeGrid } from '../components/gamification/BadgeGrid';
import { CATEGORY_COLORS } from '../constants';
import { getLevelFromPoints, getLevelProgress, getPointsToNextLevel } from '../utils/points';
export function Analytics() {
  const { state } = useApp();
  const level = getLevelFromPoints(state.totalPoints);
  const progress = getLevelProgress(state.totalPoints);
  const toNext = getPointsToNextLevel(state.totalPoints);

  const yearData = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const countMap: Record<string, number> = {};
    state.tasks.forEach(t => {
      if (t.completed && t.completed_at) {
        const d = t.completed_at.slice(0, 10);
        countMap[d] = (countMap[d] || 0) + 1;
      }
    });
    for (let i = 364; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      days.push({ date: d, count: countMap[d] || 0 });
    }
    return days;
  }, [state.tasks]);

  const monthlyData = useMemo(() => {
    const months: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM');
      const count = state.tasks.filter(t =>
        t.completed && t.completed_at && t.completed_at.startsWith(key)
      ).length;
      months.push({ month: label, count });
    }
    return months;
  }, [state.tasks]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    state.tasks.filter(t => t.completed).forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name],
    }));
  }, [state.tasks]);

  const yearGrid = useMemo(() => {
    const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
    let currentWeek: { date: string; count: number; dayOfWeek: number }[] = [];
    yearData.forEach(d => {
      const dayOfWeek = (getDay(parseISO(d.date)) + 6) % 7;
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push({ ...d, dayOfWeek });
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  }, [yearData]);

  const getYearIntensity = (count: number) => {
    if (count === 0) return 'bg-white/[0.03]';
    if (count <= 1) return 'bg-accent-cyan/15';
    if (count <= 2) return 'bg-accent-cyan/30';
    if (count <= 4) return 'bg-accent-cyan/50';
    return 'bg-accent-cyan/70';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Analytics</h2>
        <p className="text-sm text-accent-gray mt-1">Your progress at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-3xl font-display font-bold text-white">{state.tasks.filter(t => t.completed).length}</p>
          <p className="text-xs text-accent-gray mt-1">Tasks Completed</p>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-3xl font-display font-bold text-accent-cyan">{state.totalPoints}</p>
          <p className="text-xs text-accent-gray mt-1">Total XP</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-accent-gray">Level {level}</span>
            <span className="text-xs font-mono text-accent-cyan">{toNext} XP to next</span>
          </div>
          <div className="h-2 bg-dark-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-cyan to-accent-green rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-4">Year Overview</h3>
        <div className="flex gap-[2px] overflow-x-auto pb-2">
          {yearGrid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {Array.from({ length: 7 }, (_, di) => {
                const day = week.find(d => d.dayOfWeek === di);
                if (!day) return <div key={di} className="w-[10px] h-[10px]" />;
                return (
                  <div
                    key={di}
                    className={`w-[10px] h-[10px] rounded-[1px] ${getYearIntensity(day.count)}`}
                    title={`${day.date}: ${day.count} tasks`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fill: '#8899aa', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8899aa', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{
                  background: '#1a1f2e',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#e8e8e8',
                }}
              />
              <Bar dataKey="count" fill="#00d9ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Category Breakdown</h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-accent-gray">{item.name}</span>
                    <span className="text-xs font-mono text-white ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-accent-gray/40 text-xs py-8">Complete tasks to see breakdown</p>
          )}
        </div>
      </div>

      <BadgeGrid />
    </div>
  );
}
