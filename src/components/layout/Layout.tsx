import { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Notification } from './Notification';
import { useApp } from '../../context/AppContext';

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useApp();

  if (!state.initialized) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-[#0f1419]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#00d9ff]/30 border-t-[#00d9ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8899aa] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-dark-primary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="lg:hidden flex items-center px-4 h-14 shrink-0 border-b border-white/[0.08] bg-dark-secondary/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-accent-gray hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-display font-bold text-white">SuperApp</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="pb-20 lg:pb-4">
            {children}
          </div>
        </main>
      </div>
      <Notification />
    </div>
  );
}
