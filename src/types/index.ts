export type Category = string;
export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type ViewMode = 'list' | 'kanban';
export type SortField = 'created_at' | 'due_date' | 'priority' | 'completed' | 'time_estimate';
export type DateFilter = 'all' | 'today' | 'this_week' | 'overdue';

export interface Task {
  id: string;
  session_id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  time_estimate: number;
  links: string[];
  notes: string;
  recurrence: Recurrence;
  completed: boolean;
  completed_at: string | null;
  points_awarded: number;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  session_id: string;
  name: string;
  icon: string;
  color: string;
  completed_dates: string[];
  streak: number;
  best_streak: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DayActivity {
  date: string;
  count: number;
  categories: Partial<Record<Category, number>>;
}

export interface TaskFilters {
  categories: Category[];
  priorities: Priority[];
  dateFilter: DateFilter;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
  showActiveOnly: boolean;
}
