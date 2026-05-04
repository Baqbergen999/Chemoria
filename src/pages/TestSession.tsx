import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getQuestionsForTopic, getAllQuestions, Question } from '../data/questions';
import { TOPICS } from '../data/topics';
import { Check, X, ArrowRight, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import AnimatedBackground from '../components/AnimatedBackground';

export default function TestSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTestResult, markTopicComplete } = useStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScoreRender, setFinalScoreRender] = useState(0);
  
  // Timer
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    let q: Question[] = [];
    if (id === 'mixed') {
      const all = getAllQuestions().sort(() => Math.random() - 0.5);
      q = all.slice(0, 15);
    } else {
      const topic = TOPICS.find(t => t.id === id);
      if (topic) {
        q = getQuestionsForTopic(id!, topic.title).sort(() => Math.random() - 0.5).slice(0, 15);
      }
    }
    setQuestions(q);
  }, [id]);

  if (questions.length === 0) return <div className="text-white text-center mt-20">Тест жүктелуде...</div>;

  const currentQ = questions[currentIndex];

  const handleSelect = (opt: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    if (opt === currentQ.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
    } else {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(totalTime);
      
      const realFinalScore = score + (selectedOption === currentQ.answer ? 1 : 0);
      setFinalScoreRender(realFinalScore);
      setIsFinished(true);
      
      const isPassing = realFinalScore / questions.length >= 0.7; // 70% to pass
      
      addTestResult({
        topicId: id || 'mixed',
        score: realFinalScore,
        totalQuestions: questions.length
      });

      if (id !== 'mixed' && isPassing) {
        markTopicComplete(id!, Math.round((realFinalScore / questions.length) * 100));
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 100 });
      }
    }
  };

  if (isFinished) {
    const isPassing = finalScoreRender / questions.length >= 0.7;
    const percentage = Math.round((finalScoreRender / questions.length) * 100);

    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col items-center">
        <AnimatedBackground />
        <div className="glass-panel p-10 flex flex-col items-center text-center w-full">
          <Trophy className={`h-20 w-20 mb-6 ${isPassing ? 'text-yellow-400' : 'text-neutral-500'}`} />
          <h2 className="text-3xl font-bold mb-2">{isPassing ? 'Тест сәтті өтті!' : 'Тесттен өтпедіңіз'}</h2>
          <p className="text-slate-400 mb-8">Сіз {percentage}% ({finalScoreRender}/{questions.length}) жинадыңыз, кеткен уақыт: {Math.floor(timeSpent/60)}м {timeSpent%60}с.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4 px-4 sm:px-0">
            <button onClick={() => navigate('/testing')} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl border border-white/10 font-bold transition-colors text-white w-full sm:w-auto">
              Тесттерге оралу
            </button>
            {id !== 'mixed' && isPassing ? (
              <button 
                onClick={() => {
                  const currIdx = TOPICS.findIndex(t => t.id === id);
                  if (currIdx < TOPICS.length - 1) {
                    navigate(`/topic/${TOPICS[currIdx+1].id}`);
                  } else {
                    navigate('/');
                  }
                }}
                className="bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white px-6 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto flex justify-center items-center"
              >
                Келесі Тақырып <ArrowRight className="inline h-4 w-4 ml-2" />
              </button>
            ) : (
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white px-6 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto"
                >
                  Қайта тапсыру
                </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 relative z-10">
      <AnimatedBackground />
      
      <div className="flex justify-between items-center mb-6 text-sm text-slate-400 font-mono">
        <span>Сұрақ {currentIndex + 1} / {questions.length}</span>
        <span>Ұпай: {score}</span>
      </div>

      <div className="w-full bg-white/5 h-2 rounded-full mb-10 overflow-hidden border border-white/10">
        <div 
          className="h-full bg-gradient-to-r from-[var(--color-brand-400)] to-[var(--color-accent-400)] transition-all duration-300" 
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      <div className="glass-panel p-8 mb-8">
        <h3 className="text-2xl font-bold mb-8">{currentQ.question}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentQ.answer;
            
            let btnClass = "text-left p-4 rounded-xl border-2 transition-all duration-300 min-h-[80px] ";
            
            if (selectedOption === null) {
              btnClass += "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 text-slate-200";
            } else {
              if (isCorrect) {
                btnClass += "bg-green-500/20 border-green-500 text-white";
              } else if (isSelected && !isCorrect) {
                btnClass += "bg-red-500/20 border-red-500 text-white";
              } else {
                btnClass += "bg-white/5 border-white/10 opacity-50 text-slate-400";
              }
            }

            return (
              <button
                key={i}
                disabled={selectedOption !== null}
                onClick={() => handleSelect(opt)}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {selectedOption !== null && isCorrect && <Check className="h-5 w-5 text-green-400" />}
                  {selectedOption !== null && isSelected && !isCorrect && <X className="h-5 w-5 text-red-400" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedOption !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <button 
              onClick={handleNext}
              className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              {currentIndex < questions.length - 1 ? 'Келесі Сұрақ' : 'Тестті Аяқтау'} 
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
