import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { Task, Habit } from '../types';
import { supabase, ensureSession, getSessionId } from '../lib/supabase';
import { loadTasksFromStorage, saveTasksToStorage, loadHabitsFromStorage, saveHabitsToStorage, loadPointsFromStorage, savePointsToStorage } from '../utils/storage';
import { calculateTaskPoints, getLevelFromPoints } from '../utils/points';
import { calculateStreak, getToday } from '../utils/dates';
import { DEFAULT_HABITS, BADGE_DEFINITIONS, ALL_HABITS_BONUS } from '../constants';

interface AppState {
  tasks: Task[];
  habits: Habit[];
  totalPoints: number;
  isOnline: boolean;
  lastSynced: string | null;
  initialized: boolean;
  notification: { message: string; type: 'points' | 'badge' | 'streak' | 'info' } | null;
}

type Action =
  | { type: 'SET_TASKS'; tasks: Task[] }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'COMPLETE_TASK'; id: string; points: number }
  | { type: 'SET_HABITS'; habits: Habit[] }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; habit: Habit }
  | { type: 'DELETE_HABIT'; id: string }
  | { type: 'TOGGLE_HABIT'; id: string }
  | { type: 'SET_POINTS'; points: number }
  | { type: 'ADD_POINTS'; points: number }
  | { type: 'SET_ONLINE'; isOnline: boolean }
  | { type: 'SET_SYNCED'; time: string }
  | { type: 'SET_INITIALIZED' }
  | { type: 'SET_NOTIFICATION'; notification: AppState['notification'] }
  | { type: 'CLEAR_NOTIFICATION' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.tasks };
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    case 'COMPLETE_TASK': {
      const now = new Date().toISOString();
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id
            ? { ...t, completed: true, status: 'done' as const, completed_at: now, points_awarded: action.points, updated_at: now }
            : t
        ),
        totalPoints: state.totalPoints + action.points,
      };
    }
    case 'SET_HABITS':
      return { ...state, habits: action.habits };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] };
    case 'UPDATE_HABIT':
      return { ...state, habits: state.habits.map(h => h.id === action.habit.id ? action.habit : h) };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.id) };
    case 'TOGGLE_HABIT': {
      const today = getToday();
      return {
        ...state,
        habits: state.habits.map(h => {
          if (h.id !== action.id) return h;
          const alreadyDone = h.completed_dates.includes(today);
          const newDates = alreadyDone
            ? h.completed_dates.filter(d => d !== today)
            : [...h.completed_dates, today];
          const newStreak = calculateStreak(newDates);
          return {
            ...h,
            completed_dates: newDates,
            streak: newStreak,
            best_streak: Math.max(h.best_streak, newStreak),
            updated_at: new Date().toISOString(),
          };
        }),
      };
    }
    case 'SET_POINTS':
      return { ...state, totalPoints: action.points };
    case 'ADD_POINTS':
      return { ...state, totalPoints: state.totalPoints + action.points };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.isOnline };
    case 'SET_SYNCED':
      return { ...state, lastSynced: action.time };
    case 'SET_INITIALIZED':
      return { ...state, initialized: true };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.notification };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  addTask: (task: Omit<Task, 'id' | 'session_id' | 'created_at' | 'updated_at' | 'completed' | 'completed_at' | 'points_awarded' | 'status'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  uncompleteTask: (id: string) => Promise<void>;
  addHabit: (name: string, icon: string, color: string) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  syncData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    tasks: loadTasksFromStorage(),
    habits: loadHabitsFromStorage(),
    totalPoints: loadPointsFromStorage(),
    isOnline: navigator.onLine,
    lastSynced: null,
    initialized: false,
    notification: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const notificationTimer = useRef<ReturnType<typeof setTimeout>>();

  const showNotification = useCallback((message: string, type: 'points' | 'badge' | 'streak' | 'info') => {
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    dispatch({ type: 'SET_NOTIFICATION', notification: { message, type } });
    notificationTimer.current = setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 3000);
  }, []);

  useEffect(() => {
    saveTasksToStorage(state.tasks);
  }, [state.tasks]);

  useEffect(() => {
    saveHabitsToStorage(state.habits);
  }, [state.habits]);

  useEffect(() => {
    savePointsToStorage(state.totalPoints);
  }, [state.totalPoints]);

  const syncFromSupabase = useCallback(async () => {
    try {
      const sessionId = getSessionId();

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (tasks && tasks.length > 0) {
        const mapped = tasks.map(t => ({ ...t, links: t.links || [] }));
        dispatch({ type: 'SET_TASKS', tasks: mapped });
      }

      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (habits && habits.length > 0) {
        const mapped = habits.map(h => ({ ...h, completed_dates: h.completed_dates || [] }));
        dispatch({ type: 'SET_HABITS', habits: mapped });
      } else if (stateRef.current.habits.length === 0) {
        const defaults = DEFAULT_HABITS.map(h => ({
          session_id: sessionId,
          name: h.name,
          icon: h.icon,
          color: h.color,
        }));
        const { data: created } = await supabase.from('habits').insert(defaults).select();
        if (created) {
          dispatch({ type: 'SET_HABITS', habits: created.map(h => ({ ...h, completed_dates: h.completed_dates || [] })) });
        }
      }

      const totalPoints = (tasks || [])
        .filter(t => t.completed)
        .reduce((sum, t) => sum + (t.points_awarded || 0), 0);
      dispatch({ type: 'SET_POINTS', points: totalPoints });
      dispatch({ type: 'SET_SYNCED', time: new Date().toISOString() });
    } catch {
      // offline fallback
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        await ensureSession();
        await syncFromSupabase();
      } catch {
        // offline
      }
      dispatch({ type: 'SET_INITIALIZED' });
    }
    init();
  }, [syncFromSupabase]);

  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE', isOnline: true });
      syncFromSupabase();
    };
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', isOnline: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncFromSupabase]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'session_id' | 'created_at' | 'updated_at' | 'completed' | 'completed_at' | 'points_awarded' | 'status'>) => {
    const sessionId = getSessionId();
    const now = new Date().toISOString();
    const optimistic: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      session_id: sessionId,
      status: 'todo',
      completed: false,
      completed_at: null,
      points_awarded: 0,
      created_at: now,
      updated_at: now,
    };

    dispatch({ type: 'ADD_TASK', task: optimistic });

    try {
      const { data } = await supabase
        .from('tasks')
        .insert({
          session_id: sessionId,
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          priority: taskData.priority,
          due_date: taskData.due_date,
          time_estimate: taskData.time_estimate,
          links: taskData.links,
          notes: taskData.notes,
          recurrence: taskData.recurrence,
        })
        .select()
        .single();

      if (data) {
        dispatch({ type: 'UPDATE_TASK', task: { ...data, links: data.links || [] } });
      }
    } catch {
      // keep optimistic
    }
  }, []);

  const updateTask = useCallback(async (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', task });
    try {
      await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: task.status,
          due_date: task.due_date,
          time_estimate: task.time_estimate,
          links: task.links,
          notes: task.notes,
          recurrence: task.recurrence,
        })
        .eq('id', task.id);
    } catch {
      // keep local
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_TASK', id });
    try {
      await supabase.from('tasks').delete().eq('id', id);
    } catch {
      // keep local
    }
  }, []);

  const completeTask = useCallback(async (id: string) => {
    const s = stateRef.current;
    const task = s.tasks.find(t => t.id === id);
    if (!task || task.completed) return;

    const points = calculateTaskPoints(task.priority, task.time_estimate);
    dispatch({ type: 'COMPLETE_TASK', id, points });

    const newTotal = s.totalPoints + points;
    const oldLevel = getLevelFromPoints(s.totalPoints);
    const newLevel = getLevelFromPoints(newTotal);

    showNotification(`+${points} points`, 'points');

    if (newLevel > oldLevel) {
      setTimeout(() => showNotification(`Level ${newLevel} reached!`, 'badge'), 1500);
    }

    const completedToday = s.tasks.filter(t => t.completed && t.completed_at && t.completed_at.startsWith(getToday())).length + 1;
    const totalCompleted = s.tasks.filter(t => t.completed).length + 1;
    const hpCount = s.tasks.filter(t => t.completed && t.priority === 'high').length + (task.priority === 'high' ? 1 : 0);

    const badge = BADGE_DEFINITIONS.find(b => {
      if (b.field === 'tasksToday') return completedToday >= b.threshold && completedToday - 1 < b.threshold;
      if (b.field === 'totalCompleted') return totalCompleted >= b.threshold && totalCompleted - 1 < b.threshold;
      if (b.field === 'level') return newLevel >= b.threshold && oldLevel < b.threshold;
      if (b.field === 'highPriorityCompleted' && task.priority === 'high') return hpCount >= b.threshold && hpCount - 1 < b.threshold;
      return false;
    });

    if (badge) {
      setTimeout(() => showNotification(`Badge unlocked: ${badge.name}!`, 'badge'), 2000);
    }

    try {
      await supabase
        .from('tasks')
        .update({
          completed: true,
          status: 'done',
          completed_at: new Date().toISOString(),
          points_awarded: points,
        })
        .eq('id', id);
    } catch {
      // keep local
    }
  }, [showNotification]);

  const uncompleteTask = useCallback(async (id: string) => {
    const s = stateRef.current;
    const task = s.tasks.find(t => t.id === id);
    if (!task || !task.completed) return;

    const updatedTask: Task = {
      ...task,
      completed: false,
      status: 'todo',
      completed_at: null,
      points_awarded: 0,
      updated_at: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_TASK', task: updatedTask });
    dispatch({ type: 'ADD_POINTS', points: -task.points_awarded });

    try {
      await supabase
        .from('tasks')
        .update({ completed: false, status: 'todo', completed_at: null, points_awarded: 0 })
        .eq('id', id);
    } catch {
      // keep local
    }
  }, []);

  const addHabit = useCallback(async (name: string, icon: string, color: string) => {
    const sessionId = getSessionId();
    const optimistic: Habit = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      name,
      icon,
      color,
      completed_dates: [],
      streak: 0,
      best_streak: 0,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_HABIT', habit: optimistic });

    try {
      const { data } = await supabase
        .from('habits')
        .insert({ session_id: sessionId, name, icon, color })
        .select()
        .single();
      if (data) {
        dispatch({ type: 'UPDATE_HABIT', habit: { ...data, completed_dates: data.completed_dates || [] } });
      }
    } catch {
      // keep optimistic
    }
  }, []);

  const toggleHabit = useCallback(async (id: string) => {
    const s = stateRef.current;
    const habit = s.habits.find(h => h.id === id);
    if (!habit) return;

    dispatch({ type: 'TOGGLE_HABIT', id });

    const today = getToday();
    const alreadyDone = habit.completed_dates.includes(today);
    const newDates = alreadyDone
      ? habit.completed_dates.filter(d => d !== today)
      : [...habit.completed_dates, today];
    const newStreak = calculateStreak(newDates);

    if (!alreadyDone) {
      const allDone = s.habits.every(h =>
        h.id === id ? true : h.completed_dates.includes(today)
      );
      if (allDone && s.habits.length > 0) {
        dispatch({ type: 'ADD_POINTS', points: ALL_HABITS_BONUS });
        showNotification(`+${ALL_HABITS_BONUS} bonus - all habits complete!`, 'streak');
      }
    }

    try {
      await supabase
        .from('habits')
        .update({
          completed_dates: newDates,
          streak: newStreak,
          best_streak: Math.max(habit.best_streak, newStreak),
        })
        .eq('id', id);
    } catch {
      // keep local
    }
  }, [showNotification]);

  const deleteHabit = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_HABIT', id });
    try {
      await supabase.from('habits').delete().eq('id', id);
    } catch {
      // keep local
    }
  }, []);

  const syncData = useCallback(async () => {
    await syncFromSupabase();
  }, [syncFromSupabase]);

  return (
    <AppContext.Provider value={{
      state,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      uncompleteTask,
      addHabit,
      toggleHabit,
      deleteHabit,
      syncData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
