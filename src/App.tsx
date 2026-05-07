/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navigation from './components/Navigation';
import { useStore } from './store/useStore';
import Home from './pages/Home';
import Topic from './pages/Topic';
import Practice from './pages/Practice';
import Testing from './pages/Testing';
import TestSession from './pages/TestSession';
import Analytics from './pages/Analytics';
import MolecularReality from './pages/MolecularReality';
import LectureEditor from './pages/LectureEditor';

export default function App() {
  const { updateStreak } = useStore();

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return (
    <div className="min-h-screen bg-[var(--color-background-main)] text-slate-200 flex flex-col font-sans">
      <Navigation />
      <main className="flex-grow pt-16 flex flex-col relative w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topic/:id" element={<Topic />} />
          <Route path="/test/:id" element={<TestSession />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reality" element={<MolecularReality />} />
          <Route path="/lecture/:topicId" element={<LectureEditor />} />
        </Routes>
      </main>
    </div>
  );
}

