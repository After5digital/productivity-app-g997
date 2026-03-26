import { Zap, Trophy, Flame, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const ICON_MAP = {
  points: Zap,
  badge: Trophy,
  streak: Flame,
  info: Info,
};

const COLOR_MAP = {
  points: 'text-accent-cyan',
  badge: 'text-accent-gold',
  streak: 'text-accent-orange',
  info: 'text-accent-gray',
};

export function Notification() {
  const { state } = useApp();

  return (
    <AnimatePresence>
      {state.notification && (
        <motion.div
          key={state.notification.message}
          initial={{ opacity: 0, x: 80, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 right-4 z-[100]"
        >
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 card-shadow">
            {(() => {
              const Icon = ICON_MAP[state.notification.type];
              const colorClass = COLOR_MAP[state.notification.type];
              return <Icon className={`w-5 h-5 ${colorClass}`} />;
            })()}
            <span className="text-sm font-medium text-white">{state.notification.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
