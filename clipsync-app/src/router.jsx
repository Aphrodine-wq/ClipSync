/**
 * Router Configuration
 * Route-based code splitting with lazy loading
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load components for code splitting
const App = lazy(() => import('./App'));
const SettingsScreen = lazy(() => import('./components/screens/SettingsScreen'));
const PricingScreen = lazy(() => import('./components/screens/PricingScreen'));
const TeamsListScreen = lazy(() => import('./components/screens/TeamsListScreen'));
const SnippetLibrary = lazy(() => import('./components/features/developer/SnippetLibrary'));
const DevTools = lazy(() => import('./components/features/developer/DevTools'));
const GitHelper = lazy(() => import('./components/features/developer/GitHelper'));
const WorkflowAutomation = lazy(() => import('./components/features/developer/WorkflowAutomation'));
const HistoryScreen = lazy(() => import('./components/screens/HistoryScreen'));
const ScreenshotHelper = lazy(() => import('./components/common/ScreenshotHelper'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl font-bold text-white">Y</span>
      </div>
      <div className="inline-block w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
      <p className="text-sm text-zinc-600 mt-4">Loading...</p>
    </div>
  </div>
);

/**
 * Router Component
 */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/history" element={<HistoryScreen onClose={() => window.history.back()} />} />
          <Route path="/settings" element={<SettingsScreen onClose={() => window.history.back()} />} />
          <Route path="/pricing" element={<PricingScreen onClose={() => window.history.back()} />} />
          <Route path="/teams" element={<TeamsListScreen />} />
          <Route path="/snippets" element={<SnippetLibrary onClose={() => window.history.back()} />} />
          <Route path="/dev-tools" element={<DevTools onClose={() => window.history.back()} />} />
          <Route path="/git-helper" element={<GitHelper onClose={() => window.history.back()} />} />
          <Route path="/workflows" element={<WorkflowAutomation onClose={() => window.history.back()} />} />
          <Route path="/screenshots" element={<ScreenshotHelper />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;

