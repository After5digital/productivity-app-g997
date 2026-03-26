import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Plus, Link as LinkIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CATEGORY_COLORS, DEFAULT_CATEGORIES, TIME_ESTIMATES } from '../../constants';
import type { Task, Priority, Recurrence } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: '#ff4444' },
  { value: 'medium', label: 'Medium', color: '#ffa500' },
  { value: 'low', label: 'Low', color: '#00ff88' },
];

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function TaskModal({ isOpen, onClose, editTask }: TaskModalProps) {
  const { state, addTask, updateTask } = useApp();
  const titleRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [timeEstimate, setTimeEstimate] = useState(30);
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [showLinks, setShowLinks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const allCategories = useMemo(() => {
    const defaults = [...DEFAULT_CATEGORIES] as string[];
    const custom = state.tasks
      .map(t => t.category)
      .filter(c => !defaults.includes(c));
    return [...defaults, ...new Set(custom)];
  }, [state.tasks]);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description);
      setCategory(editTask.category);
      setPriority(editTask.priority);
      setDueDate(editTask.due_date || '');
      setTimeEstimate(editTask.time_estimate);
      setLinks(editTask.links || []);
      setNotes(editTask.notes);
      setRecurrence(editTask.recurrence);
      setShowLinks((editTask.links || []).length > 0);
      setShowNotes(!!editTask.notes);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setPriority('medium');
      setDueDate('');
      setTimeEstimate(30);
      setLinks([]);
      setNewLink('');
      setNotes('');
      setRecurrence('none');
      setShowLinks(false);
      setShowNotes(false);
    }
    setCustomCategory('');
    setShowCustomInput(false);
  }, [editTask, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => titleRef.current?.focus(), 100);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editTask) {
      await updateTask({
        ...editTask,
        title: title.trim(),
        description,
        category,
        priority,
        due_date: dueDate || null,
        time_estimate: timeEstimate,
        links,
        notes,
        recurrence,
        updated_at: new Date().toISOString(),
      });
    } else {
      await addTask({
        title: title.trim(),
        description,
        category,
        priority,
        due_date: dueDate || null,
        time_estimate: timeEstimate,
        links,
        notes,
        recurrence,
      });
    }
    onClose();
  };

  const addLink = () => {
    if (newLink.trim()) {
      setLinks([...links, newLink.trim()]);
      setNewLink('');
    }
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (trimmed) {
      setCategory(trimmed);
      setCustomCategory('');
      setShowCustomInput(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label={editTask ? 'Edit task' : 'New task'}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-lg"
              >
                <form
                  onSubmit={handleSubmit}
                  className="bg-dark-secondary border border-white/[0.08] rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                    <h2 className="font-display font-semibold text-white">
                      {editTask ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-accent-gray hover:text-white transition-colors" aria-label="Close">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <input
                      ref={titleRef}
                      type="text"
                      placeholder="Task title..."
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-dark-tertiary border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-accent-gray/40 focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm"
                      required
                    />

                    <textarea
                      placeholder="Description (optional)"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-dark-tertiary border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-accent-gray/40 focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm resize-none"
                    />

                    <div>
                      <label className="text-xs text-accent-gray mb-2 block">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {allCategories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                              category === cat
                                ? 'text-dark-primary'
                                : 'text-accent-gray bg-white/[0.04] hover:bg-white/[0.08]'
                            }`}
                            style={category === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : undefined}
                          >
                            {cat}
                          </button>
                        ))}
                        {!showCustomInput && (
                          <button
                            type="button"
                            onClick={() => setShowCustomInput(true)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-accent-gray bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200 flex items-center gap-1 border border-dashed border-white/[0.12]"
                          >
                            <Plus className="w-3 h-3" /> Custom
                          </button>
                        )}
                      </div>
                      {showCustomInput && (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Category name..."
                            value={customCategory}
                            onChange={e => setCustomCategory(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomCategory();
                              }
                            }}
                            className="flex-1 bg-dark-tertiary border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-accent-cyan/40 transition-colors"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={addCustomCategory}
                            className="px-3 py-1.5 bg-accent-cyan/20 text-accent-cyan rounded-lg text-xs hover:bg-accent-cyan/30 transition-colors"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowCustomInput(false); setCustomCategory(''); }}
                            className="px-2 py-1.5 text-accent-gray hover:text-white transition-colors"
                            aria-label="Cancel custom category"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-accent-gray mb-2 block">Priority</label>
                      <div className="flex gap-2">
                        {PRIORITIES.map(p => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setPriority(p.value)}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              priority === p.value
                                ? 'border-2'
                                : 'border border-white/[0.08] text-accent-gray hover:bg-white/[0.04]'
                            }`}
                            style={priority === p.value ? { borderColor: p.color, color: p.color, backgroundColor: `${p.color}15` } : undefined}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-accent-gray mb-2 block">Due Date</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={e => setDueDate(e.target.value)}
                          className="w-full bg-dark-tertiary border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-cyan/40 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-accent-gray mb-2 block">Time Estimate</label>
                        <select
                          value={timeEstimate}
                          onChange={e => setTimeEstimate(Number(e.target.value))}
                          className="w-full bg-dark-tertiary border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-cyan/40 transition-colors"
                        >
                          {TIME_ESTIMATES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-accent-gray mb-2 block">Recurring</label>
                      <div className="flex flex-wrap gap-2">
                        {(['none', 'daily', 'weekly', 'monthly'] as Recurrence[]).map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRecurrence(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              recurrence === r
                                ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                                : 'bg-white/[0.04] text-accent-gray border border-transparent hover:bg-white/[0.08]'
                            }`}
                          >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!showLinks && (
                        <button
                          type="button"
                          onClick={() => setShowLinks(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-accent-gray bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                        >
                          <LinkIcon className="w-3.5 h-3.5" /> Add Links
                        </button>
                      )}
                      {!showNotes && (
                        <button
                          type="button"
                          onClick={() => setShowNotes(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-accent-gray bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Notes
                        </button>
                      )}
                    </div>

                    {showLinks && (
                      <div>
                        <label className="text-xs text-accent-gray mb-2 block">Links</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={newLink}
                            onChange={e => setNewLink(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
                            className="flex-1 bg-dark-tertiary border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-cyan/40 transition-colors"
                          />
                          <button type="button" onClick={addLink} className="px-3 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg text-xs hover:bg-accent-cyan/30 transition-colors">
                            Add
                          </button>
                        </div>
                        {links.map((link, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-accent-cyan mb-1">
                            <LinkIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate flex-1">{link}</span>
                            <button type="button" onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="text-danger/60 hover:text-danger">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showNotes && (
                      <div>
                        <label className="text-xs text-accent-gray mb-2 block">Notes</label>
                        <textarea
                          placeholder="Quick notes..."
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          rows={3}
                          className="w-full bg-dark-tertiary border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-accent-gray/40 focus:outline-none focus:border-accent-cyan/40 transition-colors text-xs resize-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-5 border-t border-white/[0.06] flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm text-accent-gray hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-dark-primary bg-accent-cyan hover:bg-accent-cyan/90 transition-all"
                    >
                      {editTask ? 'Save Changes' : 'Add Task'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
