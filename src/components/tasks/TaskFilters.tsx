import { memo, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORY_COLORS, DEFAULT_CATEGORIES } from '../../constants';
import { useApp } from '../../context/AppContext';
import type { TaskFilters as Filters, DateFilter, SortField } from '../../types';

interface TaskFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}
const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'overdue', label: 'Overdue' },
];
const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at', label: 'Created' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'time_estimate', label: 'Estimate' },
];

export const TaskFilters = memo(function TaskFilters({ filters, onChange, showFilters, onToggleFilters }: TaskFiltersProps) {
  const { state } = useApp();

  const allCategories = useMemo(() => {
    const defaults = [...DEFAULT_CATEGORIES] as string[];
    const custom = state.tasks
      .map(t => t.category)
      .filter(c => !defaults.includes(c));
    return [...defaults, ...new Set(custom)];
  }, [state.tasks]);

  const hasActiveFilters = filters.categories.length > 0 ||
    filters.dateFilter !== 'all' ||
    filters.searchQuery !== '' ||
    filters.showActiveOnly;

  const toggleCategory = (cat: string) => {
    const cats = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: cats });
  };

  const clearFilters = () => {
    onChange({
      categories: [],
      priorities: [],
      dateFilter: 'all',
      sortField: 'created_at',
      sortDirection: 'desc',
      searchQuery: '',
      showActiveOnly: false,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-gray/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.searchQuery}
            onChange={e => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full bg-dark-tertiary border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-accent-gray/40 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan/30 transition-colors"
            aria-label="Search tasks"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            showFilters || hasActiveFilters
              ? 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan'
              : 'border-white/[0.08] text-accent-gray hover:text-white hover:bg-white/[0.04]'
          }`}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <button
          onClick={() => onChange({ ...filters, showActiveOnly: !filters.showActiveOnly })}
          className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all shrink-0 ${
            filters.showActiveOnly
              ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
              : 'border-white/[0.08] text-accent-gray hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          Active
        </button>
      </div>

      {showFilters && (
        <div className="glass rounded-xl p-4 space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <span className="text-xs text-accent-gray">Filters</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div>
            <span className="text-[10px] text-accent-gray/60 mb-1.5 block">Category</span>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(cat => {
                const active = filters.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      active ? 'text-dark-primary' : 'text-accent-gray bg-white/[0.04] hover:bg-white/[0.08]'
                    }`}
                    style={active ? { backgroundColor: CATEGORY_COLORS[cat] } : undefined}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-accent-gray/60 mb-1.5 block">Date</span>
              <div className="flex flex-wrap gap-1.5">
                {DATE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ ...filters, dateFilter: opt.value })}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      filters.dateFilter === opt.value
                        ? 'bg-accent-cyan/20 text-accent-cyan'
                        : 'bg-white/[0.04] text-accent-gray hover:bg-white/[0.08]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-accent-gray/60 mb-1.5 block">Sort</span>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onChange({
                      ...filters,
                      sortField: opt.value,
                      sortDirection: filters.sortField === opt.value && filters.sortDirection === 'asc' ? 'desc' : 'asc',
                    })}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      filters.sortField === opt.value
                        ? 'bg-accent-cyan/20 text-accent-cyan'
                        : 'bg-white/[0.04] text-accent-gray hover:bg-white/[0.08]'
                    }`}
                  >
                    {opt.label}
                    {filters.sortField === opt.value && (filters.sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
