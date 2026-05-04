import { Trophy, Clock, Medal, Star, GitCommit, Link as LinkIcon, Play, Key } from 'lucide-react';
import { useStore } from '../store/useStore';
import AnimatedBackground from '../components/AnimatedBackground';
import { useNavigate } from 'react-router-dom';
import { TOPICS } from '../data/topics';

export default function Testing() {
  const { xp, achievements, progress } = useStore();
  const navigate = useNavigate();

  // Determine unlocked topics
  const unlockedTopicIds = new Set<string>(TOPICS.map(t => t.id));

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <AnimatedBackground />

      <div className="text-center mb-16 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Тестілеу <span className="neon-text text-[var(--color-accent-500)]">Орталығы</span>
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-lg">
          Өз біліміңізді дәлелдеңіз. Жалғастыру үшін тақырыптық тесттерді тапсырыңыз немесе жаһандық емтихан тапсырыңыз.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-400 h-6 w-6" /> Сынақ Режимдері
          </h2>
          
           <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-neutral-600 transition-colors border-l-4 border-l-[var(--color-accent-400)]">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-full bg-neutral-800/80 transition-transform`}>
                  <Star className={`h-8 w-8 text-[var(--color-accent-400)]`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Жаһандық Аралас Тест</h3>
                  <p className="text-neutral-400">Барлық ашылған тақырыптар бойынша 15 кездейсоқ сұрақ.</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/test/mixed')}
                className="bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white px-6 py-3 rounded-xl font-bold transition-colors uppercase tracking-widest text-xs flex items-center gap-2 w-full md:w-auto"
              >
                <Play className="h-4 w-4" /> Бастау
              </button>
           </div>
          
          <div className="mt-12 pt-8 border-t border-white/10">
             <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <GitCommit className="text-[var(--color-brand-500)] h-6 w-6" /> Тақырыптық Тесттер
             </h2>
             <p className="text-slate-400 mb-6">Барлық тақырыптар ашық. Бұл тақырыптар бойынша біліміңізді тексеріңіз.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {TOPICS.map((topic, i) => {
                 const isUnlocked = unlockedTopicIds.has(topic.id);
                 const p = progress[topic.id];
                 return (
                   <div key={topic.id} className={`glass-panel p-4 flex flex-col justify-between transition-colors ${!isUnlocked ? 'opacity-50 cursor-not-allowed border-dashed' : 'hover:border-white/30'}`}>
                     <div>
                       <div className="flex justify-between items-start mb-2">
                         <span className="text-xs font-mono text-slate-500 uppercase">{topic.difficulty}</span>
                         {p?.completed && <span className="text-xs text-green-400 font-bold">{p.bestScore}%</span>}
                       </div>
                       <h3 className="font-bold text-lg mb-1">{topic.title}</h3>
                     </div>
                     <div className="mt-4">
                       {isUnlocked ? (
                         <button 
                            onClick={() => navigate(`/test/${topic.id}`)}
                            className="bg-white/10 hover:bg-white/20 text-white w-full py-2 rounded-lg text-sm font-bold transition-colors"
                          >
                           Тест тапсыру
                         </button>
                       ) : (
                         <div className="bg-black/30 text-slate-500 w-full py-2 rounded-lg text-sm font-bold text-center flex items-center justify-center gap-2">
                           <Key className="h-4 w-4" /> Құлыпталған
                         </div>
                       )}
                     </div>
                   </div>
                 )
               })}
             </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="glass-panel p-6 sticky top-24">
            <div className="text-center pb-6 border-b border-neutral-800">
               <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-tr from-[var(--color-brand-500)] to-[var(--color-accent-500)] p-1 mb-4">
                 <div className="w-full h-full bg-neutral-900 rounded-full flex flex-col items-center justify-center">
                   <div className="text-2xl font-bold">{xp}</div>
                   <div className="text-[10px] text-neutral-400 font-mono">Жалпы XP</div>
                 </div>
               </div>
               <h3 className="text-xl font-bold">Деңгей {Math.floor(xp / 500) + 1} - Химик</h3>
               <p className="text-sm text-neutral-400 mt-2">Келесі деңгей: {(Math.floor(xp / 500) + 1) * 500} XP</p>
            </div>

            <div className="pt-6">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-neutral-300">
                <Medal className="h-4 w-4" /> Сіздің Жетістіктеріңіз
              </h4>
              <div className="space-y-3">
                {achievements.length > 0 ? (
                  achievements.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                      <Star className="h-4 w-4 text-yellow-400" /> {a}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 bg-neutral-800/20 rounded-lg text-neutral-500 text-sm italic border border-neutral-800/50">
                    Деңгейді көтеру үшін XP жинап, тесттерді аяқтаңыз! Алғашқы жетістіктер жасырылған.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}