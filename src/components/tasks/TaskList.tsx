import { useMemo, useState, useCallback, useEffect } from 'react';
import { Plus, ListChecks } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskModal } from './TaskModal';
import { isOverdue, isDueToday, getToday } from '../../utils/dates';
import type { Task, TaskFilters as Filters } from '../../types';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function TaskList() {
  const { state } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    function onNewTask() {
      setEditingTask(null);
      setModalOpen(true);
    }
    window.addEventListener('app:new-task', onNewTask);
    return () => window.removeEventListener('app:new-task', onNewTask);
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priorities: [],
    dateFilter: 'all',
    sortField: 'created_at',
    sortDirection: 'desc',
    searchQuery: '',
    showActiveOnly: false,
  });

  const filteredTasks = useMemo(() => {
    let tasks = [...state.tasks];

    if (filters.showActiveOnly) {
      tasks = tasks.filter(t => !t.completed);
    }

    if (filters.categories.length > 0) {
      tasks = tasks.filter(t => filters.categories.includes(t.category));
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
      );
    }

    if (filters.dateFilter === 'today') {
      tasks = tasks.filter(t => isDueToday(t.due_date) || (t.completed && t.completed_at?.startsWith(getToday())));
    } else if (filters.dateFilter === 'this_week') {
      const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      tasks = tasks.filter(t => {
        if (t.due_date && t.due_date >= start && t.due_date <= end) return true;
        if (t.completed_at) {
          const d = t.completed_at.slice(0, 10);
          return d >= start && d <= end;
        }
        return false;
      });
    } else if (filters.dateFilter === 'overdue') {
      tasks = tasks.filter(t => !t.completed && isOverdue(t.due_date));
    }

    tasks.sort((a, b) => {
      if (!filters.showActiveOnly) {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
      }

      const dir = filters.sortDirection === 'asc' ? 1 : -1;
      switch (filters.sortField) {
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return dir * a.due_date.localeCompare(b.due_date);
        case 'priority':
          return dir * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        case 'time_estimate':
          return dir * (a.time_estimate - b.time_estimate);
        default:
          return dir * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    });

    return tasks;
  }, [state.tasks, filters]);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setEditingTask(null);
  }, []);

  const activeCount = state.tasks.filter(t => !t.completed).length;
  const completedCount = state.tasks.filter(t => t.completed).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Tasks</h2>
          <p className="text-sm text-accent-gray mt-1">
            {activeCount} active, {completedCount} completed
          </p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-cyan text-dark-primary rounded-xl text-sm font-medium hover:bg-accent-cyan/90 transition-all shadow-lg shadow-accent-cyan/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <div className="mt-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} />
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <ListChecks className="w-12 h-12 text-accent-gray/20 mx-auto mb-3" />
            <p className="text-accent-gray/40 text-sm">
              {state.tasks.length === 0 ? 'No tasks yet. Add your first one.' : 'No tasks match your filters.'}
            </p>
          </div>
        )}
      </div>

      <TaskModal isOpen={modalOpen} onClose={handleClose} editTask={editingTask} />
    </div>
  );
}
