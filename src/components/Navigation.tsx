import { Link, useLocation } from 'react-router-dom';
import { Home, Beaker, CheckCircle, BarChart2, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { xp, streak } = useStore();

  const navItems = [
    { name: 'Басты бет', path: '/', icon: Home },
    { name: 'Тәжірибе', path: '/practice', icon: CheckCircle },
    { name: 'Тестілеу', path: '/testing', icon: Zap },
    { name: 'Аналитика', path: '/analytics', icon: BarChart2 },
    { name: 'Реалити-зертхана', path: '/reality', icon: Beaker },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Beaker className="h-8 w-8 text-[var(--color-brand-400)]" />
                <span className="font-bold text-xl neon-text tracking-tight">OrgChem Mastery</span>
              </Link>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-[var(--color-brand-400)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 font-mono">СЕРИЯ</span>
                  <span className="text-sm font-bold text-orange-400 flex items-center gap-1">
                    🔥 {streak}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 font-mono">ТӘЖІРИБЕ</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <span className="text-[var(--color-brand-400)]">✨</span> {xp}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white p-2">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-64 z-50 bg-[var(--color-background-main)] border-l border-white/10 shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full pt-16 px-4 pb-6 space-y-4">
                <div className="flex justify-end mb-2">
                  <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex justify-around mb-4 pb-4 border-b border-white/10">
                  <div className="text-center">
                    <span className="block text-xs text-slate-500 font-mono">СЕРИЯ</span>
                    <span className="block text-lg font-bold text-orange-400">🔥 {streak}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs text-slate-500 font-mono">ТӘЖІРИБЕ</span>
                    <span className="block text-lg font-bold text-white"><span className="text-[var(--color-brand-400)]">✨</span> {xp}</span>
                  </div>
                </div>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-white/10 text-[var(--color-brand-400)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
