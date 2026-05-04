import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle, Eye, HelpCircle, Layers, TestTube, Play, X as CloseIcon, BookOpen } from 'lucide-react';
import { TOPICS, TOPIC_CONTENT } from '../data/topics';
import { useStore } from '../store/useStore';
import MoleculeViewer, { MOCK_MOLECULES } from '../components/MoleculeViewer';
import AnimatedBackground from '../components/AnimatedBackground';
import ReactionSimulation from '../components/ReactionSimulation';

export default function Topic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const topic = TOPICS.find(t => t.id === id);
  const content = TOPIC_CONTENT[id || ''] || TOPIC_CONTENT['t1'];
  
  const { progress, updateTopicTime } = useStore();
  const isCompleted = progress[id || '']?.completed;

  const [viewerMode, setViewerMode] = useState<'ball-stick' | 'space-fill' | 'skeletal'>('ball-stick');
  const [showLabels, setShowLabels] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [isLectureOpen, setIsLectureOpen] = useState(false);

  // Time tracking
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      updateTopicTime(id, 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [id, updateTopicTime]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!topic) return <div className="p-8 text-center text-red-400">Тақырып табылмады</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 pb-32">
      <AnimatedBackground />
      
      {/* Header */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Басты бетке оралу
      </button>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl rounded-full" style={{ backgroundImage: `linear-gradient(to bottom left, ${topic.color}, transparent)` }} />
            <h1 className="text-4xl font-bold mb-4" style={{ color: topic.color }}>{topic.title}</h1>
            <p className="text-xl text-neutral-300 mb-6 leading-relaxed">
              {topic.description}
            </p>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                {topic.difficulty}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-[var(--color-brand-500)] text-sm font-bold bg-[var(--color-brand-500)]/20 px-3 py-1 rounded-full">
                  <CheckCircle className="h-4 w-4" /> Аяқталды (Нәтиже: {progress[topic.id]?.bestScore}%)
                </span>
              )}
            </div>

            <button 
              onClick={() => setIsLectureOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl border border-white/10 font-bold transition-colors flex items-center gap-2"
            >
              <BookOpen className="h-5 w-5 text-blue-400" /> Толық Дәрісті Оқу
            </button>
          </motion.div>

          {/* Quick Explanations */}
          <div className="space-y-6 mt-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="text-[var(--color-brand-500)] h-6 w-6" /> Қысқаша шолу
            </h2>
            {content.explanations?.map((exp: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 border-l-2"
                style={{ borderLeftColor: topic.color }}
              >
                <h3 className="text-xl font-bold mb-3">{exp.title}</h3>
                <p className="text-neutral-400 text-lg leading-relaxed">{exp.content}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3D Viewer Area */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-1 flex-1 min-h-[400px] relative">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-2 border border-neutral-800 flex flex-col gap-2">
               <button 
                onClick={() => setViewerMode('ball-stick')}
                className={`text-xs px-3 py-1 rounded transition-colors ${viewerMode === 'ball-stick' ? 'bg-[var(--color-brand-500)] text-black font-bold' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
              >
                Шар-стерженьді
              </button>
              <button 
                onClick={() => setViewerMode('space-fill')}
                className={`text-xs px-3 py-1 rounded transition-colors ${viewerMode === 'space-fill' ? 'bg-[var(--color-brand-500)] text-black font-bold' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
              >
                Кеңістікті толтыру
              </button>
              <button 
                onClick={() => setViewerMode('skeletal')}
                className={`text-xs px-3 py-1 rounded transition-colors ${viewerMode === 'skeletal' ? 'bg-[var(--color-brand-500)] text-black font-bold' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
              >
                Қаңқалы
              </button>
              <div className="h-px bg-neutral-700 w-full my-1" />
              <button 
                onClick={() => setShowLabels(!showLabels)}
                className={`text-xs px-3 py-1 rounded flex items-center justify-between gap-2 transition-colors ${showLabels ? 'text-white' : 'text-neutral-500'}`}
              >
                <Eye className="h-3 w-3" /> Белгілер
              </button>
            </div>
            
            <div className="absolute top-4 right-4 z-10 flex gap-2">
               <div className="bg-black/50 backdrop-blur text-white text-xs font-mono px-3 py-1 rounded border border-neutral-800 flex items-center gap-2">
                 <TestTube className="h-3 w-3" style={{color: topic.color}} /> {topic.moleculeFormula}
               </div>
            </div>

            <div className="w-full h-full rounded-xl overflow-hidden cursor-move">
              <MoleculeViewer 
                model={MOCK_MOLECULES[topic.moleculeFormula] || MOCK_MOLECULES['Methane']} 
                mode={viewerMode}
                showLabels={showLabels}
              />
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
              <span className="bg-black/50 backdrop-blur text-neutral-400 text-xs px-3 py-1 rounded-full border border-neutral-800">
                Бұру үшін сүйреңіз • Масштабтау үшін айналдырыңыз
              </span>
            </div>
          </motion.div>
          <ReactionSimulation color={topic.color} />
        </div>
      </div>

      {/* Curiosity Questions */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <HelpCircle className="text-[var(--color-accent-500)] h-6 w-6" /> Тереңірек Зерттеу
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.curiosity?.map((q: any, i: number) => (
            <motion.div 
              key={i} 
              className="glass-panel p-6 cursor-pointer hover:border-neutral-600 transition-colors"
              onClick={() => setActiveQuestion(activeQuestion === i ? null : i)}
            >
              <h3 className="font-bold text-lg mb-2 flex items-start justify-between">
                {q.q}
                <span className="text-[var(--color-brand-500)] text-sm ml-4 font-mono">
                  {activeQuestion === i ? '- Жасыру' : '+ Ашу'}
                </span>
              </h3>
              <AnimatePresence>
                {activeQuestion === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[var(--color-brand-600)] mt-4 pt-4 border-t border-neutral-800 leading-relaxed font-medium">
                      {q.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <button 
          onClick={() => navigate(`/test/${topic.id}`)}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]`}
        >
          <Play className="h-6 w-6" /> Тестті Бастау
        </button>
      </div>

      {/* Lecture Modal */}
      <AnimatePresence>
        {isLectureOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
            >
              <button 
                onClick={() => setIsLectureOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors backdrop-blur-md"
              >
                <CloseIcon className="h-6 w-6" />
              </button>

              <div className="p-8 pb-4 border-b border-neutral-800">
                <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                  <BookOpen className="text-blue-400" />
                  {topic.title} - Толық Дәріс
                </h2>
              </div>

              <div className="overflow-y-auto p-4 sm:p-8 space-y-12 custom-scrollbar">
                {content.explanations?.map((exp: any, i: number) => (
                  <div key={i} className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                      <h3 className="text-2xl font-bold text-[var(--color-brand-400)]">{exp.title}</h3>
                      <p className="text-neutral-300 text-lg leading-relaxed">{exp.content}</p>
                    </div>
                    {exp.image && (
                      <div className="w-full md:w-1/2 aspect-video rounded-xl overflow-hidden border border-neutral-700">
                        <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
