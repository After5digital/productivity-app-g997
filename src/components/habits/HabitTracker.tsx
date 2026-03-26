import { useState } from 'react';
import { Check, Flame, Plus, Trash2, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getToday } from '../../utils/dates';
import { HabitCalendar } from './HabitCalendar';

export function HabitTracker() {
  const { state, toggleHabit, addHabit, deleteHabit } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const today = getToday();

  const activeHabits = state.habits.filter(h => h.active);
  const completedToday = activeHabits.filter(h => h.completed_dates.includes(today)).length;
  const allDone = activeHabits.length > 0 && completedToday === activeHabits.length;

  const selectedHabitData = selectedHabit ? state.habits.find(h => h.id === selectedHabit) : null;

  const handleAdd = () => {
    if (newName.trim()) {
      addHabit(newName.trim(), 'activity', '#00ff88');
      setNewName('');
      setShowAdd(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Habits</h2>
          <p className="text-sm text-accent-gray mt-1">
            {completedToday}/{activeHabits.length} done today
            {allDone && <span className="text-accent-green ml-2">All complete!</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl border transition-all ${
              showSettings
                ? 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan'
                : 'border-white/[0.08] text-accent-gray hover:text-white hover:bg-white/[0.04]'
            }`}
            aria-label="Manage habits"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-green text-dark-primary rounded-xl text-sm font-medium hover:bg-accent-green/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Habit</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass rounded-xl p-4 flex gap-2">
              <input
                type="text"
                placeholder="Habit name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
                className="flex-1 bg-dark-tertiary border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-accent-gray/40 focus:outline-none focus:ring-1 focus:ring-accent-green/40 focus:border-accent-green/40 transition-colors min-w-0"
              />
              <button onClick={handleAdd} className="px-4 py-2 bg-accent-green/20 text-accent-green rounded-lg text-sm font-medium hover:bg-accent-green/30 transition-colors shrink-0">
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-2 mb-6">
        {activeHabits.map(habit => {
          const doneToday = habit.completed_dates.includes(today);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = yesterday.toISOString().slice(0, 10);
          const doneYesterday = habit.completed_dates.includes(yStr);
          const missedDays = !doneToday && !doneYesterday;

          return (
            <motion.div
              key={habit.id}
              layout
              className={`glass rounded-xl p-4 flex items-center gap-4 transition-all duration-200 glass-hover cursor-pointer ${
                doneToday ? 'border-l-[3px] border-l-accent-green' : missedDays ? 'border-l-[3px] border-l-danger/50' : ''
              }`}
              onClick={() => toggleHabit(habit.id)}
            >
              <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                doneToday
                  ? 'bg-accent-green/20 border-accent-green'
                  : 'border-white/20 hover:border-accent-green/40'
              }`}>
                {doneToday && <Check className="w-4 h-4 text-accent-green animate-checkmark" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${doneToday ? 'text-accent-gray' : 'text-white'}`}>
                  {habit.name}
                </h4>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {habit.streak > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-accent-orange" />
                    <span className="text-xs font-mono text-accent-orange">{habit.streak}</span>
                  </div>
                )}

                {!doneToday && missedDays && (
                  <span className="text-[10px] text-danger/70">missed</span>
                )}

                {showSettings && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteHabit(habit.id); }}
                    className="p-1.5 text-accent-gray hover:text-danger transition-colors"
                    aria-label={`Delete ${habit.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedHabit(selectedHabit === habit.id ? null : habit.id);
                  }}
                  className="text-[10px] text-accent-gray/50 hover:text-accent-gray transition-colors px-1.5 py-0.5"
                >
                  calendar
                </button>
              </div>
            </motion.div>
          );
        })}

        {activeHabits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-accent-gray/40 text-sm">No habits yet. Add your first one.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedHabitData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <HabitCalendar habit={selectedHabitData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
