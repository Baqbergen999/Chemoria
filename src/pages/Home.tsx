import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { TOPICS } from '../data/topics';
import { useStore } from '../store/useStore';
import AnimatedBackground from '../components/AnimatedBackground';
import { Play, Lock } from 'lucide-react';

const TopicCard = ({ topic, progress, isLocked }: { topic: any, progress: any, isLocked: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isCompleted = progress?.completed;

  return (
    <motion.div
      onHoverStart={() => !isLocked && setIsHovered(true)}
      onHoverEnd={() => !isLocked && setIsHovered(false)}
      whileHover={!isLocked ? { y: -10, rotateX: 5, rotateY: 5, scale: 1.02 } : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      style={{ perspective: 1000 }}
      className={`relative glass-panel p-6 min-h-[16rem] flex flex-col justify-between overflow-hidden ${isLocked ? 'opacity-50 cursor-not-allowed border-dashed border-white/20' : 'cursor-pointer border-l-4 group'}`}
    >
      {!isLocked && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom right, ${topic.color}, transparent)` }} />
          <div 
            className="absolute inset-x-0 bottom-0 h-1 transition-all duration-300"
            style={{ backgroundColor: topic.color, opacity: isHovered ? 1 : 0.5 }}
          />
        </>
      )}
      
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-slate-400">
           <Lock className="w-8 h-8 mb-2 opacity-50" />
           <span className="font-mono text-sm uppercase tracking-widest opacity-80">Құлыпталған</span>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
            {topic.difficulty}
          </span>
          {isCompleted && (
            <span className="text-xs font-bold bg-[var(--color-brand-500)]/20 text-[var(--color-brand-400)] px-2 py-1 rounded">
              {progress.bestScore}%
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors" style={{ color: isHovered ? topic.color : 'inherit' }}>
          {topic.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-3">
          {topic.description}
        </p>
      </div>

      <div className="relative z-10 flex justify-between items-center mt-4">
        <span className="font-mono text-sm" style={{ color: !isLocked ? topic.color : 'inherit' }}>
          {topic.moleculeFormula}
        </span >
        
        {!isLocked && (
          <Link to={`/topic/${topic.id}`} onClick={(e) => e.stopPropagation()}>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white transition-colors">
              <Play className="h-4 w-4" style={{ color: topic.color }} />
            </button>
          </Link>
        )}
      </div>
      
      {!isLocked && (
        <motion.div 
          animate={{ rotate: isHovered ? 180 : 0, scale: isHovered ? 1.2 : 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none"
        >
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke={topic.color} strokeWidth="2" strokeDasharray="5,5" />
            <circle cx="50" cy="10" r="8" fill={topic.color} />
            <circle cx="15" cy="70" r="8" fill={topic.color} />
            <circle cx="85" cy="70" r="8" fill={topic.color} />
            <path d="M 50 18 L 50 50 M 22 66 L 50 50 M 78 66 L 50 50" stroke={topic.color} strokeWidth="2" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function Home() {
  const { progress } = useStore();
  const navigate = useNavigate();
  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const overallProgress = Math.round((completedCount / TOPICS.length) * 100);

  // Derive unlocked topics
  const unlockedTopicIds = new Set<string>(TOPICS.map(t => t.id));

  const handleContinueLearning = () => {
    // Find the first unlocked topic that is NOT completed
    const nextTopic = TOPICS.find(t => unlockedTopicIds.has(t.id) && !progress[t.id]?.completed) || TOPICS[0];
    navigate(`/topic/${nextTopic.id}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <AnimatedBackground />
      
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8 bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-white/10 rounded-[1.5rem] p-6 lg:p-8">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="neon-text">Органикалық Химияны</span> Меңгеріңіз
          </h1>
          <p className="text-slate-400 max-w-xl text-base sm:text-lg mx-auto md:mx-0">
            3D форматындағы оқыту, интерактивті тәжірибелер мен ойын түрдегі сынақтар. Молекулалар туралы оқып қоймай — оларды сезініңіз.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center shrink-0">
          <div className="text-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * overallProgress) / 100} className="text-[var(--color-brand-400)] transition-all duration-1000 ease-out" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-brand-400)" />
                    <stop offset="100%" stopColor="var(--color-accent-400)" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-xl font-bold">{overallProgress}%</span>
            </div>
            <span className="text-sm font-mono text-slate-500 mt-2 block">ПРОГРЕСС</span>
          </div>
          
          <div className="flex flex-col gap-3">
             <button onClick={handleContinueLearning} className="primary-button group">
               Оқуды жалғастыру
               <Play className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {TOPICS.map((topic, i) => {
          const isLocked = !unlockedTopicIds.has(topic.id);
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !isLocked && navigate(`/topic/${topic.id}`)}
              className={isLocked ? 'pointer-events-none' : ''}
            >
              <TopicCard topic={topic} progress={progress[topic.id]} isLocked={isLocked} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
