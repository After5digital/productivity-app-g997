import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { DailySummary } from '../components/dashboard/DailySummary';
import { Heatmap } from '../components/dashboard/Heatmap';
import { WeeklyChart } from '../components/dashboard/WeeklyChart';
import { QuickStats } from '../components/dashboard/QuickStats';
import { TaskModal } from '../components/tasks/TaskModal';
import { useApp } from '../context/AppContext';
import { getToday } from '../utils/dates';

export function Dashboard() {
  const { state, toggleHabit } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const today = getToday();

  const activeHabits = state.habits.filter(h => h.active);

  const handleToggle = useCallback((id: string) => {
    toggleHabit(id);
  }, [toggleHabit]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <DailySummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Heatmap />
        </div>
        <div>
          <QuickStats />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyChart />

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Today's Habits</h3>
            <span className="text-xs font-mono text-accent-green">
              {activeHabits.filter(h => h.completed_dates.includes(today)).length}/{activeHabits.length}
            </span>
          </div>
          <div className="space-y-2">
            {activeHabits.map(habit => {
              const done = habit.completed_dates.includes(today);
              return (
                <button
                  key={habit.id}
                  onClick={() => handleToggle(habit.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    done
                      ? 'bg-accent-green/10 text-accent-gray'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] text-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    done ? 'bg-accent-green/20 border-accent-green' : 'border-white/20'
                  }`}>
                    {done && (
                      <svg className="w-3 h-3 text-accent-green" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm flex-1 text-left">{habit.name}</span>
                  {habit.streak > 0 && (
                    <span className="text-[10px] font-mono text-accent-orange">{habit.streak}d</span>
                  )}
                </button>
              );
            })}
            {activeHabits.length === 0 && (
              <p className="text-center text-accent-gray/40 text-xs py-4">No habits configured</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent-cyan text-dark-primary rounded-2xl shadow-lg shadow-accent-cyan/30 flex items-center justify-center hover:scale-105 transition-transform z-30 lg:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>

      <TaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
