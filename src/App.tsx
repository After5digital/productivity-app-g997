import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';

const Tasks = lazy(() => import('./pages/Tasks').then(m => ({ default: m.Tasks })));
const Habits = lazy(() => import('./pages/Habits').then(m => ({ default: m.Habits })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

function Loading() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
    </div>
  );
}

function KeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.metaKey || e.ctrlKey) return;

      switch (e.key) {
        case '1': navigate('/'); break;
        case '2': navigate('/tasks'); break;
        case '3': navigate('/habits'); break;
        case '4': navigate('/analytics'); break;
        case '5': navigate('/settings'); break;
        case 'n':
        case 'N':
          navigate('/tasks');
          setTimeout(() => window.dispatchEvent(new CustomEvent('app:new-task')), 50);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <KeyboardShortcuts />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
