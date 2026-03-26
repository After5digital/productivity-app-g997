import { useState } from 'react';
import { Download, Upload, Trash2, RefreshCw, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Settings() {
  const { state, syncData } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleExport = () => {
    const data = {
      tasks: state.tasks,
      habits: state.habits,
      totalPoints: state.totalPoints,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `superapp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.tasks) {
          localStorage.setItem('super_app_tasks', JSON.stringify(data.tasks));
        }
        if (data.habits) {
          localStorage.setItem('super_app_habits', JSON.stringify(data.habits));
        }
        if (data.totalPoints !== undefined) {
          localStorage.setItem('super_app_points', String(data.totalPoints));
        }
        window.location.reload();
      } catch {
        alert('Invalid backup file');
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (confirmClear) {
      localStorage.removeItem('super_app_tasks');
      localStorage.removeItem('super_app_habits');
      localStorage.removeItem('super_app_points');
      window.location.reload();
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 5000);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncData();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-accent-gray mt-1">Manage your data and preferences</p>
      </div>

      <div className="glass rounded-xl divide-y divide-white/[0.06]">
        <div className="p-5">
          <h3 className="text-sm font-medium text-white mb-1">Sync Status</h3>
          <p className="text-xs text-accent-gray mb-3">
            {state.isOnline ? 'Connected to Supabase' : 'Offline - using local data'}
          </p>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${state.isOnline ? 'bg-accent-green animate-pulse-glow' : 'bg-danger'}`} />
            <span className="text-xs text-accent-gray">
              {state.lastSynced
                ? `Last synced: ${new Date(state.lastSynced).toLocaleTimeString()}`
                : 'Not synced yet'}
            </span>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 text-accent-cyan rounded-xl text-xs font-medium hover:bg-accent-cyan/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-medium text-white mb-1">Data</h3>
          <p className="text-xs text-accent-gray mb-3">
            {state.tasks.length} tasks, {state.habits.length} habits, {state.totalPoints} XP
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] text-accent-gray hover:text-white rounded-xl text-xs font-medium hover:bg-white/[0.08] transition-all border border-white/[0.06]"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] text-accent-gray hover:text-white rounded-xl text-xs font-medium hover:bg-white/[0.08] transition-all border border-white/[0.06]"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-medium text-white mb-1">Storage</h3>
          <p className="text-xs text-accent-gray mb-3">
            Data is stored locally and synced to Supabase when online.
          </p>
          <div className="flex items-center gap-2 text-xs text-accent-gray">
            <Database className="w-3.5 h-3.5" />
            <span>Local + Cloud backup</span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-medium text-danger mb-1">Danger Zone</h3>
          <p className="text-xs text-accent-gray mb-3">
            Clear all local data. This cannot be undone.
          </p>
          <button
            onClick={handleClear}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
              confirmClear
                ? 'bg-danger/20 text-danger border-danger/30'
                : 'bg-white/[0.04] text-accent-gray hover:text-danger border-white/[0.06] hover:border-danger/30'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmClear ? 'Click again to confirm' : 'Clear All Data'}
          </button>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-3">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { key: 'N', desc: 'New task' },
            { key: '/', desc: 'Search' },
            { key: '1-5', desc: 'Navigate pages' },
          ].map(({ key, desc }) => (
            <div key={key} className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-dark-tertiary rounded-md text-[10px] font-mono text-accent-gray border border-white/[0.08] min-w-[28px] text-center">
                {key}
              </kbd>
              <span className="text-xs text-accent-gray">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
