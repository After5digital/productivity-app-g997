import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Activity, Settings, Zap, BarChart3, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getLevelFromPoints, getLevelProgress } from '../../utils/points';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', key: '1' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks', key: '2' },
  { to: '/habits', icon: Activity, label: 'Habits', key: '3' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', key: '4' },
  { to: '/settings', icon: Settings, label: 'Settings', key: '5' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = memo(function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { state } = useApp();
  const level = getLevelFromPoints(state.totalPoints);
  const progress = getLevelProgress(state.totalPoints);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-dark-secondary border-r border-white/[0.08]
          flex flex-col transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
              <Zap className="w-5 h-5 text-dark-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-white tracking-tight">SuperApp</h1>
              <p className="text-[11px] text-accent-gray font-mono">v1.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-accent-gray hover:text-white transition-colors p-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 mb-6 shrink-0">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-accent-gray">Level {level}</span>
              <span className="text-xs font-mono text-accent-cyan">{state.totalPoints} XP</span>
            </div>
            <div className="h-1.5 bg-dark-primary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-cyan to-accent-green rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label, key }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-accent-gray hover:text-white hover:bg-white/[0.04]'
                }`
              }
              aria-label={label}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1">{label}</span>
              <kbd className="text-[9px] font-mono text-accent-gray/30 hidden lg:block">{key}</kbd>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 shrink-0">
          <div className="flex items-center justify-center gap-2 text-[10px] text-accent-gray/50 font-mono">
            <div className={`w-1.5 h-1.5 rounded-full ${state.isOnline ? 'bg-accent-green' : 'bg-danger'}`} />
            {state.isOnline ? 'Synced' : 'Offline'}
          </div>
        </div>
      </aside>
    </>
  );
});
