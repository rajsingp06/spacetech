import React, { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load the Map component to reduce initial bundle size (Phase 3 Optimization)
const Map = lazy(() => import('./components/Map'));

function App() {
  return (
    <ErrorBoundary>
      <div className="App w-full h-screen overflow-hidden bg-gray-900">
        <Suspense fallback={
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-200 font-semibold animate-pulse">Loading Map Engine...</p>
          </div>
        }>
          <Map />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
