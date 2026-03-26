import type { Task, Habit } from '../types';

const TASKS_KEY = 'super_app_tasks';
const HABITS_KEY = 'super_app_habits';
const POINTS_KEY = 'super_app_points';

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // storage full or unavailable
  }
}

export function loadHabitsFromStorage(): Habit[] {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHabitsToStorage(habits: Habit[]): void {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch {
    // storage full or unavailable
  }
}

export function loadPointsFromStorage(): number {
  try {
    const raw = localStorage.getItem(POINTS_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function savePointsToStorage(points: number): void {
  try {
    localStorage.setItem(POINTS_KEY, String(points));
  } catch {
    // storage full or unavailable
  }
}
