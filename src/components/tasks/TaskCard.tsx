import { memo, useState } from 'react';
import { Check, Pencil, Trash2, ExternalLink, ChevronDown, ChevronUp, Clock, Undo2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CATEGORY_COLORS, PRIORITY_COLORS } from '../../constants';
import { formatDate, isOverdue, isDueToday } from '../../utils/dates';
import type { Task } from '../../types';

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard = memo(function TaskCard({ task, onEdit }: TaskCardProps) {
  const { completeTask, uncompleteTask, deleteTask } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const categoryColor = CATEGORY_COLORS[task.category];
  const priorityColor = PRIORITY_COLORS[task.priority];
  const overdue = !task.completed && isOverdue(task.due_date);
  const dueToday = !task.completed && isDueToday(task.due_date);

  const handleToggle = () => {
    if (task.completed) {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteTask(task.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group glass rounded-xl transition-all duration-200 glass-hover ${task.completed ? 'completed-task' : ''}`}
      style={{ borderLeftWidth: 3, borderLeftColor: categoryColor }}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={handleToggle}
          className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            task.completed
              ? 'bg-accent-green/20 border-accent-green'
              : 'border-white/20 hover:border-accent-green/60'
          }`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && (
            <Check className="w-3.5 h-3.5 text-accent-green animate-checkmark" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`task-title text-sm font-medium leading-tight break-words ${
                task.completed ? 'text-accent-gray' : 'text-white'
              }`}
            >
              {task.title}
            </h4>
            <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {task.completed && (
                <button
                  onClick={handleToggle}
                  className="p-1.5 text-accent-gray hover:text-accent-cyan transition-colors"
                  aria-label="Undo completion"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 text-accent-gray hover:text-accent-cyan transition-colors"
                aria-label="Edit task"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className={`p-1.5 transition-colors ${confirmDelete ? 'text-danger' : 'text-accent-gray hover:text-danger'}`}
                aria-label={confirmDelete ? 'Confirm delete' : 'Delete task'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-accent-gray/70 mt-1 line-clamp-2 break-words">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
            >
              {task.category}
            </span>

            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: priorityColor }}
              title={`${task.priority} priority`}
            />

            {task.due_date && (
              <span className={`text-[10px] font-mono ${
                overdue ? 'text-danger' : dueToday ? 'text-accent-gold' : 'text-accent-gray/60'
              }`}>
                {overdue ? 'Overdue: ' : dueToday ? 'Today' : ''}{!dueToday && formatDate(task.due_date)}
              </span>
            )}

            <span className="text-[10px] text-accent-gray/50 flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {formatTime(task.time_estimate)}
            </span>

            {task.recurrence !== 'none' && (
              <span className="text-[10px] text-accent-cyan/60">{task.recurrence}</span>
            )}

            {task.points_awarded > 0 && (
              <span className="text-[10px] font-mono text-accent-green">+{task.points_awarded} XP</span>
            )}
          </div>

          {confirmDelete && (
            <p className="text-xs text-danger mt-2">Click delete again to confirm</p>
          )}

          {(task.links.length > 0 || task.notes) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] text-accent-gray/50 hover:text-accent-gray mt-2 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Less' : 'More'}
            </button>
          )}

          {expanded && (
            <div className="mt-3 space-y-2">
              {task.links.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{link}</span>
                </a>
              ))}
              {task.notes && (
                <p className="text-[11px] text-accent-gray/60 whitespace-pre-wrap bg-dark-primary/50 rounded-lg p-2 break-words">
                  {task.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
