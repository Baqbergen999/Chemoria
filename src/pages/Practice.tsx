import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import { useStore } from '../store/useStore';
import { FlaskConical, Check, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAllQuestions } from '../data/questions';

const REACTION_PROBLEMS = [
  {
    type: 'reaction',
    reactant: 'Алкен',
    reagent: 'H2O / H+',
    product: 'Спирт',
    options: ['Спирт', 'Алкан', 'Кетон', 'Эфир']
  },
  {
    type: 'reaction',
    reactant: 'Біріншілік спирт',
    reagent: 'PCC',
    product: 'Альдегид',
    options: ['Карбон қышқылы', 'Эфир', 'Альдегид', 'Алкен']
  },
  {
    type: 'reaction',
    reactant: 'Бензол',
    reagent: 'Br2 / FeBr3',
    product: 'Бромбензол',
    options: ['Бромбензол', 'Циклогексан', 'Фенол', 'Реакция жүрмейді']
  }
];

export default function Practice() {
  const { addXp } = useStore();
  const allConceptQs = useMemo(() => getAllQuestions(), []);
  
  // Mixed practice: reactions + concepts
  const [problems, setProblems] = useState<any[]>(() => {
     const mixed = [...REACTION_PROBLEMS];
     // Add 5 random concept questions
     const shuffledQs = [...allConceptQs].sort(() => Math.random() - 0.5).slice(0, 5);
     return [...mixed, ...shuffledQs].sort(() => Math.random() - 0.5);
  });

  const [currentProblem, setCurrentProblem] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const problem = problems[currentProblem];

  const handleSelect = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    
    let correct = false;
    if (problem.type === 'reaction') {
       correct = option === problem.product;
    } else {
       correct = option === problem.answer;
    }
    
    setIsCorrect(correct);

    if (correct) {
      addXp(20);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f0ff', '#10b981']
      });
    }
  };

  const handleNext = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      // Loop with new random questions
      const mixed = [...REACTION_PROBLEMS];
      const shuffledQs = [...allConceptQs].sort(() => Math.random() - 0.5).slice(0, 5);
      setProblems([...mixed, ...shuffledQs].sort(() => Math.random() - 0.5));
      setCurrentProblem(0);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  if (!problem) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <FlaskConical className="h-10 w-10 text-[var(--color-brand-500)]" />
          Интерактивті <span className="neon-text text-[var(--color-brand-500)]">Тәжірибе</span>
        </h1>
        <p className="text-neutral-400 text-lg">Интуицияңызды және реакциялар туралы біліміңізді тексеріңіз.</p>
      </div>

      <div className="w-full glass-panel p-8 md:p-12 relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-800">
           <div 
             className="h-full bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-accent-500)] transition-all duration-300"
             style={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }}
           />
        </div>

        <div className="flex justify-between items-center mb-8 text-sm font-mono text-neutral-500">
          <span>Сұрақ {currentProblem + 1} / {problems.length}</span>
          <span>{problem.type === 'reaction' ? 'РЕАКЦИЯ' : 'КОНЦЕПЦИЯ'}</span>
        </div>

        {problem.type === 'reaction' ? (
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <div className="glass-panel p-6 text-xl font-bold bg-neutral-800/80 min-w-[150px] text-center border-neutral-700">
              {problem.reactant}
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-[var(--color-brand-500)] mb-1 bg-[var(--color-brand-500)]/20 px-3 py-1 rounded-full">
                {problem.reagent}
              </span>
              <ArrowRight className="h-8 w-8 text-neutral-500" />
            </div>

            <div className={`glass-panel p-6 text-xl font-bold min-w-[150px] text-center border-dashed transition-all duration-300
                ${selectedOption ? 'border-solid border-[var(--color-brand-500)] text-[var(--color-brand-500)]' : 'border-neutral-600 text-neutral-600'}
            `}>
              {selectedOption || '?'}
            </div>
          </div>
        ) : (
           <div className="text-2xl font-bold text-center mb-12 px-4">
             {problem.question}
           </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {problem.options.map((option: string, idx: number) => {
            let btnClass = "glass-button py-4 text-lg border-2 border-transparent transition-all";
            
            if (selectedOption === option) {
               if (isCorrect) {
                  btnClass += " !bg-green-500/20 !border-green-500 !text-green-400";
               } else {
                  btnClass += " !bg-red-500/20 !border-red-500 !text-red-400";
               }
            } else if (selectedOption !== null && (option === problem.product || option === problem.answer)) {
                // Show correct answer if missed
                btnClass += " !border-green-500/50 !text-green-400";
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleSelect(option)}
                className={btnClass}
              >
                {option}
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {selectedOption !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <div className="bg-green-500/20 p-2 rounded-full text-green-500">
                    <Check className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="bg-red-500/20 p-2 rounded-full text-red-500">
                    <X className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? 'Керемет!' : 'Қате, қайта көріңіз.'}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {isCorrect ? '+20 XP берілді' : 'Келесі жолы сәттілік.'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleNext}
                className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-neutral-200 transition-colors"
              >
                {currentProblem < problems.length - 1 ? 'Келесі Сұрақ' : 'Жаңадан бастау'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
